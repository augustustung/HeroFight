require('dotenv').config();
const connectDb = require('./src/config/connectDb');
const cors = require('cors');
const initServer = require('./src/routes/index');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require("socket.io");
const { fromString } = require('uuidv4');
const Player = require('./src/oop/player');
const Room = require('./src/oop/room');

connectDb();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
initServer(app);

let port = process.env.PORT || 8080;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_WEB],
    credentials: true
  },
  pingTimeout: 1000,
  pingInterval: 1000,
  transports: ['websocket', 'polling', 'flashsocket']
});


var roomList = {};
const TIME_LIMIT = 60;
const gravity = 0.7

io.on('connect', connected);

function connected(socket) {
  console.log('has connection', socket.id);

  const playerCreateRoom = async ({ roomName, player, deposit }, cb) => {
    try {
      // tao random room id
      const newRoomId = fromString(roomName + Math.random() * 100 + socket.id)

      const newRoom = new Room(newRoomId, roomName, [new Player({ ...player, userId: socket.id, isHost: true })], false, deposit)
      roomList[newRoomId] = newRoom;
      cb({
        data: newRoom
      });
      io.emit('new_room_created', newRoom);
    } catch (error) {
      console.log("Create room falied", error);
    }
  }

  const playerJoinRoom = async ({ roomId, player }, callback) => {
    // check user balance greater than room's deposit
    if (player.balance < roomList[roomId].deposit) {
      callback({
        errCode: -3,
        errMessage: "Not enough deposit",
        data: ""
      })
    } else if (roomList[roomId].players.length >= 2) {
      callback({
        errCode: -4,
        errMessage: "Room is full",
        data: ""
      })
    } else {
      roomList[roomId].players.push(new Player({ ...player, userId: socket.id, isHost: false }));
      callback({
        errCode: 0,
        errMessage: "",
        data: roomList[roomId]
      })
      io.emit('room_update', roomList[roomId]);
      io.emit("player_join", roomList[roomId]);
    }
  }

  const playerChangeStatus = async ({ roomId, newStatus, currentPlayerIndex }) => {
    roomList[roomId].players[currentPlayerIndex][newStatus.key] = newStatus.value;
    io.emit("room_has_update", roomList[roomId]);
  }

  function handleRoomStatus(roomId, isHost) {
    if (isHost) {
      // delete room
      delete roomList[roomId]
      // emit event
      io.emit("host_leave_room");
      io.emit('room_delete', roomList[roomId]);
    } else {
      // remove player
      roomList[roomId].players.pop();
      io.emit('room_update', roomList[roomId]);
      io.emit('room_has_update', roomList[roomId]);
    }
  }

  const playerLeaveRoom = ({ roomId, isHost }) => {
    handleRoomStatus(roomId, isHost);
  }

  const hostStartRoom = ({ currentRoom }, callback) => {
    roomList[currentRoom.roomId].isStart = true;
    callback(roomList[currentRoom])
    roomList[currentRoom.roomId].players[1].status = false;
    io.emit("room_start", roomList[currentRoom.roomId]);
    io.emit('room_update', roomList[currentRoom.roomId]);
  }

  const getListRoom = (cb) => {
    cb(roomList);
  }

  function handleDisconnect() {
    let roomId, playerLeave;
    Object.values(room => {
      if (room && room.players && room.players.length > 0) {
        playerLeave = room.players.find(p => p.playerId === socket.id)
        if (playerLeave) {
          roomId = room.roomId
        };
      }
    })
    if (roomId) {
      if (playerLeave.isHost) {
        clearTimeout(roomList[roomId].timerId);
        clearInterval(roomList[roomId].gameIntervalId);
        io.emit("host_leave_room");
        delete roomList[roomId];
      } else {
        handleRoomStatus(roomId, playerLeave.isHost);
      }
    }
    console.log("User has left!", socket.id);
  }

  async function playerLoadCompleted({ roomId, playerIndex }) {
    await socket.join(roomId);
    if (roomList[roomId].isStart) {
      roomList[roomId].players[playerIndex].isReady = true;
      if (
        roomList[roomId].players[0].isReady &&
        roomList[roomId].players[1].isReady
      ) {
        io.emit("start_game");
        roomList[roomId].countdownTime = TIME_LIMIT
        setTimeout(() => {
          decreaseTimer({
            roomId: roomId
          });
        }, 3000);

        class Sprite {
          constructor({
            position,
            scale = 1,
            framesMax = 1,
            offset = { x: 0, y: 0 }
          }) {
            this.position = position
            this.width = 50
            this.height = 150
            this.scale = scale
            this.framesMax = framesMax
            this.framesCurrent = 0
            this.framesElapsed = 0
            this.framesHold = 5
            this.offset = offset
          }
        }

        class Fighter extends Sprite {
          constructor({
            position,
            velocity,
            color = 'red',
            scale = 1,
            framesMax = 1,
            offset = { x: 0, y: 0 },
            sprites,
            minX,
            maxX,
            attackBox = { offset: {}, width: undefined, height: undefined },
            attackSpeed,
            damage,
            defense,
            hp
          }) {
            super({
              position,
              scale,
              framesMax,
              offset
            })
            this.minX = minX
            this.maxX = maxX
            this.velocity = velocity
            this.width = 50
            this.height = 150
            this.lastKey = "";
            this.isJumping = false;
            this.attackBox = {
              position: {
                x: this.position.x,
                y: this.position.y
              },
              offset: attackBox.offset,
              width: attackBox.width,
              height: attackBox.height
            }
            this.color = color
            this.isAttacking = false;
            this.health = hp
            this.framesCurrent = 0
            this.framesElapsed = 0
            this.framesHold = 5
            this.sprites = sprites
            this.sprite = 'idle'
            this.dead = false
            this.lastTimeAttack = new Date().getTime()
            this.attackSpeed = attackSpeed
            this.damage = damage
            this.defense = defense
            this.hp = hp
            this.keys = {
              ArrowRight: {
                pressed: false
              },
              ArrowLeft: {
                pressed: false
              }
            }
          }

          update() {
            // attack boxes
            this.attackBox.position.x = this.position.x + this.attackBox.offset.x
            this.attackBox.position.y = this.position.y + this.attackBox.offset.y

            this.position.x += this.velocity.x
            this.position.y += this.velocity.y

            // gravity function
            if (this.position.y + this.height + this.velocity.y >= 576 - 96) {
              this.velocity.y = 0
              this.position.y = 330
            } else {
              this.velocity.y += gravity
            }
          }

          getFigure() {
            return ({
              position: this.position,
              velocity: this.velocity,
              lastKey: this.lastKey,
              isJumping: this.isJumping,
              isAttacking: this.isAttacking,
              health: this.health,
              dead: this.dead,
              lastTimeAttack: this.lastTimeAttack,
              attackSpeed: this.attackSpeed,
              damage: this.damage,
              defense: this.defense,
              hp: this.hp,
              attackBox: this.attackBox,
              keys: this.keys,
              sprite: this.sprite
            })
          }
        }

        const DEFAULT_DATA = {
          hero: {
            "position": {
              "x": 296.5,
              "y": 100
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/hero/Idle.png",
            "framesMax": 11,
            "scale": 2.5,
            "color": "blue",
            "offset": {
              "x": 140,
              "y": 55
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/hero/Idle.png",
                "framesMax": 11
              },
              "run": {
                "imageSrc": "/img/hero/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/hero/Jump.png",
                "framesMax": 4
              },
              "fall": {
                "imageSrc": "/img/hero/Fall.png",
                "framesMax": 4
              },
              "attack1": {
                "imageSrc": "/img/hero/Attack.png",
                "framesMax": 6
              },
              "takeHit": {
                "imageSrc": "/img/hero/Take Hit.png",
                "framesMax": 4
              },
              "death": {
                "imageSrc": "/img/hero/Death.png",
                "framesMax": 9
              }
            },
            "attackBox": {
              "offset": {
                "x": 90,
                "y": 80
              },
              "width": 80,
              "height": 50
            },
            "minX": 6,
            "maxX": 945,
            "attackSpeed": "700",
            "damage": "50",
            "defense": "39",
            "hp": "700.53"
          },
          heroEnemy: {
            "position": {
              "x": 666.5,
              "y": 100
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/heroEnemy/Idle.png",
            "framesMax": 11,
            "scale": 2.5,
            "color": "blue",
            "offset": {
              "x": 140,
              "y": 55
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/heroEnemy/Idle.png",
                "framesMax": 11
              },
              "run": {
                "imageSrc": "/img/heroEnemy/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/heroEnemy/Jump.png",
                "framesMax": 4
              },
              "fall": {
                "imageSrc": "/img/heroEnemy/Fall.png",
                "framesMax": 4
              },
              "attack1": {
                "imageSrc": "/img/heroEnemy/Attack.png",
                "framesMax": 6
              },
              "takeHit": {
                "imageSrc": "/img/heroEnemy/Take Hit.png",
                "framesMax": 4
              },
              "death": {
                "imageSrc": "/img/heroEnemy/Death.png",
                "framesMax": 9
              }
            },
            "attackBox": {
              "offset": {
                "x": -95,
                "y": 80
              },
              "width": 80,
              "height": 50
            },
            "minX": 6,
            "maxX": 945,
            "attackSpeed": "700",
            "damage": "50",
            "defense": "39",
            "hp": "700.53"
          },
          samuraiMack: {
            "position": {
              "x": 306.5,
              "y": 0
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/samuraiMack/Idle.png",
            "framesMax": 8,
            "color": "red",
            "scale": 2.5,
            "offset": {
              "x": 215,
              "y": 157
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/samuraiMack/Idle.png",
                "framesMax": 8
              },
              "run": {
                "imageSrc": "/img/samuraiMack/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/samuraiMack/Jump.png",
                "framesMax": 2
              },
              "fall": {
                "imageSrc": "/img/samuraiMack/Fall.png",
                "framesMax": 2
              },
              "attack1": {
                "imageSrc": "/img/samuraiMack/Attack1.png",
                "framesMax": 6
              },
              "takeHit": {
                "imageSrc": "/img/samuraiMack/Take Hit.png",
                "framesMax": 4
              },
              "death": {
                "imageSrc": "/img/samuraiMack/Death.png",
                "framesMax": 6
              }
            },
            "attackBox": {
              "offset": {
                "x": 100,
                "y": 50
              },
              "width": 160,
              "height": 50
            },
            "minX": 10,
            "maxX": 940,
            "attackSpeed": "200",
            "damage": "60.4",
            "defense": "31.5",
            "hp": "665"
          },
          samuraiMackEnemy: {
            "position": {
              "x": 656.5,
              "y": 0
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/samuraiMackEnemy/Idle.png",
            "framesMax": 8,
            "scale": 2.5,
            "color": "blue",
            "offset": {
              "x": 215,
              "y": 157
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/samuraiMackEnemy/Idle.png",
                "framesMax": 8
              },
              "run": {
                "imageSrc": "/img/samuraiMackEnemy/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/samuraiMackEnemy/Jump.png",
                "framesMax": 2
              },
              "fall": {
                "imageSrc": "/img/samuraiMackEnemy/Fall.png",
                "framesMax": 2
              },
              "attack1": {
                "imageSrc": "/img/samuraiMackEnemy/Attack1.png",
                "framesMax": 6
              },
              "takeHit": {
                "imageSrc": "/img/samuraiMackEnemy/Take Hit.png",
                "framesMax": 4
              },
              "death": {
                "imageSrc": "/img/samuraiMackEnemy/Death.png",
                "framesMax": 6
              }
            },
            "attackBox": {
              "offset": {
                "x": -170,
                "y": 50
              },
              "width": 160,
              "height": 50
            },
            "maxX": 940,
            "minX": 10,
            "attackSpeed": "200",
            "damage": "60.4",
            "defense": "31.5",
            "hp": "665"
          },
          warrior: {
            "position": {
              "x": 296.5,
              "y": 0
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/warrior/Idle.png",
            "framesMax": 10,
            "scale": 2.5,
            "color": "red",
            "offset": {
              "x": 165,
              "y": 100
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/warrior/Idle.png",
                "framesMax": 10
              },
              "run": {
                "imageSrc": "/img/warrior/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/warrior/Jump.png",
                "framesMax": 3
              },
              "fall": {
                "imageSrc": "/img/warrior/Fall.png",
                "framesMax": 3
              },
              "attack1": {
                "imageSrc": "/img/warrior/Attack1.png",
                "framesMax": 7
              },
              "takeHit": {
                "imageSrc": "/img/warrior/Take Hit.png",
                "framesMax": 3
              },
              "death": {
                "imageSrc": "/img/warrior/Death.png",
                "framesMax": 7
              }
            },
            "attackBox": {
              "offset": {
                "x": 80,
                "y": 65
              },
              "width": 90,
              "height": 40
            },
            "minX": 5,
            "maxX": 945,
            "attackSpeed": "900",
            "damage": "71.3",
            "defense": "36.5",
            "hp": "635"
          },
          warriorEnemy: {
            "position": {
              "x": 686.5,
              "y": 0
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/warriorEnemy/Idle.png",
            "framesMax": 10,
            "scale": 2.5,
            "color": "blue",
            "offset": {
              "x": 165,
              "y": 100
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/warriorEnemy/Idle.png",
                "framesMax": 10
              },
              "run": {
                "imageSrc": "/img/warriorEnemy/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/warriorEnemy/Jump.png",
                "framesMax": 3
              },
              "fall": {
                "imageSrc": "/img/warriorEnemy/Fall.png",
                "framesMax": 3
              },
              "attack1": {
                "imageSrc": "/img/warriorEnemy/Attack1.png",
                "framesMax": 7
              },
              "takeHit": {
                "imageSrc": "/img/warriorEnemy/Take Hit.png",
                "framesMax": 3
              },
              "death": {
                "imageSrc": "/img/warriorEnemy/Death.png",
                "framesMax": 7
              }
            },
            "attackBox": {
              "offset": {
                "x": -90,
                "y": 65
              },
              "width": 90,
              "height": 40
            },
            "minX": 5,
            "maxX": 945,
            "attackSpeed": "900",
            "damage": "71.3",
            "defense": "36.5",
            "hp": "635"
          },
          wizard: {
            "position": {
              "x": 266.5,
              "y": 0
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/wizard/Idle.png",
            "framesMax": 6,
            "scale": 1.5,
            "color": "red",
            "offset": {
              "x": 115,
              "y": 60
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/wizard/Idle.png",
                "framesMax": 6
              },
              "run": {
                "imageSrc": "/img/wizard/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/wizard/Jump.png",
                "framesMax": 2
              },
              "fall": {
                "imageSrc": "/img/wizard/Fall.png",
                "framesMax": 2
              },
              "attack1": {
                "imageSrc": "/img/wizard/Attack1.png",
                "framesMax": 8
              },
              "takeHit": {
                "imageSrc": "/img/wizard/Take Hit.png",
                "framesMax": 4
              },
              "death": {
                "imageSrc": "/img/wizard/Death.png",
                "framesMax": 7
              }
            },
            "attackBox": {
              "offset": {
                "x": 100,
                "y": 65
              },
              "width": 90,
              "height": 50
            },
            "minX": 5,
            "maxX": 925,
            "attackSpeed": "800",
            "damage": "50.576",
            "defense": "51",
            "hp": "663"
          },
          wizardEnemy: {
            "position": {
              "x": 656.5,
              "y": 0
            },
            "velocity": {
              "x": 0,
              "y": 0
            },
            "imageSrc": "/img/wizardEnemy/Idle.png",
            "framesMax": 6,
            "scale": 1.5,
            "color": "blue",
            "offset": {
              "x": 115,
              "y": 60
            },
            "sprites": {
              "idle": {
                "imageSrc": "/img/wizardEnemy/Idle.png",
                "framesMax": 6
              },
              "run": {
                "imageSrc": "/img/wizardEnemy/Run.png",
                "framesMax": 8
              },
              "jump": {
                "imageSrc": "/img/wizardEnemy/Jump.png",
                "framesMax": 2
              },
              "fall": {
                "imageSrc": "/img/wizardEnemy/Fall.png",
                "framesMax": 2
              },
              "attack1": {
                "imageSrc": "/img/wizardEnemy/Attack1.png",
                "framesMax": 8
              },
              "takeHit": {
                "imageSrc": "/img/wizardEnemy/Take Hit.png",
                "framesMax": 4
              },
              "death": {
                "imageSrc": "/img/wizardEnemy/Death.png",
                "framesMax": 7
              }
            },
            "attackBox": {
              "offset": {
                "x": -75,
                "y": 65
              },
              "width": 90,
              "height": 50
            },
            "minX": 5,
            "maxX": 925,
            "attackSpeed": "800",
            "damage": "50.576",
            "defense": "51",
            "hp": "663"
          }
        }

        roomList[roomId].fighter1 = new Fighter(DEFAULT_DATA[roomList[roomId].players[0].champion])
        roomList[roomId].fighter2 = new Fighter(DEFAULT_DATA[roomList[roomId].players[1].champion + "Enemy"])
        io.emit('receive_action', {
          p1: roomList[roomId].fighter1,
          p2: roomList[roomId].fighter2
        })
        roomList[roomId].gameIntervalId = setInterval(() => {
          roomList[roomId].fighter1.update();
          roomList[roomId].fighter2.update();
          handleGameLogic(roomList[roomId].fighter1, roomList[roomId].fighter2);
          io.emit('receive_action', {
            p1: roomList[roomId].fighter1.getFigure(),
            p2: roomList[roomId].fighter2.getFigure()
          })
        }, 1000 / 120);
      }

      socket.on('player_do_action', playerDoAction);

      socket.on('battle_off', async ({ roomId }) => {
        clearTimeout(roomList[roomId].timerId);
        clearInterval(roomList[roomId].gameIntervalId);
        roomList[roomId].gameIntervalId = null;
        roomList[roomId].timerId = null;
        roomList[roomId].fighter1 = null;
        roomList[roomId].fighter2 = null;
        roomList[roomId].players[0].isReady = false;
        roomList[roomId].players[1].isReady = false;
        await socket.leave(roomId)
      });

    } else {
      console.log('room is not start', roomId)
    }
  }

  function decreaseTimer({
    roomId
  }) {
    if (roomList[roomId].countdownTime > 0) {
      roomList[roomId].timerId = setTimeout(() => decreaseTimer({ roomId }), 1000);
      roomList[roomId].countdownTime--;
    }

    if (roomList[roomId].countdownTime === 0) {
      roomList[roomId].fighter1 = null;
      roomList[roomId].fighter2 = null;
      roomList[roomId].players[1].status = false;
      roomList[roomId].isStart = false;
      io.emit('game_over', {
        players: roomList[roomId].players
      });
      clearTimeout(roomList[roomId].timerId);
      clearInterval(roomList[roomId].gameIntervalId);
      roomList[roomId].gameIntervalId = null;
      roomList[roomId].fighter1 = null;
      roomList[roomId].fighter2 = null;
      roomList[roomId].timerId = null;
      roomList[roomId].gameIntervalId = null;
      roomList[roomId].players[0].isReady = false;
      roomList[roomId].players[1].isReady = false;
    } else {
      io.emit('battle_update', roomList[roomId].countdownTime);
    }
  }

  function checkOnKeyUp(key, roomId, who) {
    switch (key) {
      case 'ArrowRight':
        roomList[roomId][who].keys.ArrowRight.pressed = false
        break
      case 'ArrowLeft':
        roomList[roomId][who].keys.ArrowLeft.pressed = false
        break
      default:
        break;
    }
  }

  function checkOnkeyDown(key, roomId, who) {
    switch (key) {
      case 'ArrowRight':
        if (!roomList[roomId][who].keys.ArrowRight.pressed) {
          roomList[roomId][who].keys.ArrowRight.pressed = true
        }
        roomList[roomId][who].lastKey = key
        break
      case 'ArrowLeft':
        if (!roomList[roomId][who].keys.ArrowLeft.pressed) {
          roomList[roomId][who].keys.ArrowLeft.pressed = true
        }
        roomList[roomId][who].lastKey = key
        break;
      case "ArrowUp":
        if (!roomList[roomId][who].isJumping) {
          roomList[roomId][who].isJumping = true
          setTimeout(() => {
            roomList[roomId][who].isJumping = false
          }, 800)
          roomList[roomId][who].velocity.y = -15
        }
        break;
      case " ":
        roomList[roomId][who].isAttacking = true;
        break
      default:
        break;
    }
  }

  function checkMovement(player) {
    if (player.keys.ArrowLeft.pressed && player.lastKey === 'ArrowLeft') {
      if (player.position.x <= player.minX) {
        player.position.x = player.minX + 1
        player.velocity.x = 0
      } else {
        player.velocity.x = -5
      }
      player.sprite = 'run'
    } else if (player.keys.ArrowRight.pressed && player.lastKey === 'ArrowRight') {
      if (player.position.x >= player.maxX) {
        player.position.x = player.maxX - 1
        player.velocity.x = 0
      } else {
        player.velocity.x = 5
      }
      player.sprite = 'run'
    } else {
      player.velocity.x = 0
      player.sprite = 'idle'
    }

    // jumping
    if (player.velocity.y < 0 && !player.isJumping) {
      player.sprite = 'jump'
      player.isJumping = true
    } else if (player.velocity.y > 0) {
      player.sprite = 'fall'
    }
  }

  function checkCollisionAndGetsHit(player, enemy) {
    // detect for collision & enemy gets hit
    setTimeout(() => {
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: enemy
        }) &&
        player.isAttacking
      ) {
        player.isAttacking = false
      }

      // if player misses
      if (player.isAttacking) {
        player.isAttacking = false
      }
    }, 1000)
  }

  function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
      rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
      rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&
      rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
      rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    )
  }

  async function handleGameLogic(fighter1, fighter2) {
    checkMovement(fighter1);
    checkMovement(fighter2);

    checkCollisionAndGetsHit(
      fighter1, fighter2
    );
    checkCollisionAndGetsHit(
      fighter2, fighter1
    );

    // // end game based on health
    // if (fighter1.health <= 0 || fighter2.health <= 0) {
    //   determineWinner()
    //   handleGameOver()
    // }
  }

  function playerDoAction({ roomId, key, type, who }) {
    if (type === "UP") {
      checkOnKeyUp(key, roomId, who);
    } else {
      checkOnkeyDown(key, roomId, who);
    }
  }

  // handle room
  socket.on('get_list_room', getListRoom);

  socket.on('create_room', playerCreateRoom);

  socket.on('join_room', playerJoinRoom);

  socket.on('player_change_status', playerChangeStatus);

  socket.on('player_leave_room', playerLeaveRoom);

  socket.on('host_start_room', hostStartRoom);
  // end of handle room

  // handle in game
  socket.on('player_load_completely', playerLoadCompleted);
  // end of handle in game

  socket.on('disconnect', handleDisconnect);
}

app.use(express.static(path.join(__dirname, "./build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "./build/index.html"))
);

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

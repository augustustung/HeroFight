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
const TIME_LIMIT = 60


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
      }
      socket.on('player_do_action', playerDoAction);

      socket.on('battle_off', async ({ roomId }) => {
        clearTimeout(roomList[roomId].timerId);
        roomList[roomId].timerId = null;
        roomList[roomId].players[0].isReady = false;
        roomList[roomId].players[1].isReady = false;
        await socket.leave(roomId)
      })
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
      roomList[roomId].timerId = null;
      roomList[roomId].players[0].isReady = false;
      roomList[roomId].players[1].isReady = false;
    } else {
      io.emit('battle_update', roomList[roomId].countdownTime);
    }
  }

  function playerDoAction({ roomId, ...rest }) {
    io.emit('receive_action', {
      ...rest
    });
  }

  // handle room
  socket.on('get_list_room', getListRoom);

  socket.on('create_room', playerCreateRoom);

  socket.on('join_room', playerJoinRoom);

  socket.on('load_room', async ({ roomId }) => {
    io.sockets.adapter.rooms[roomId]
    await socket.join(roomId)
  })

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

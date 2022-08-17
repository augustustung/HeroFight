import React, { useEffect, useRef, useState } from 'react'
import "./main_page.scss"
import gsap from 'gsap';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socket } from '../../Socket';

const gravity = 0.7
let player, enemy
let shop, background
let isDone
let requestAnimationFrameId

function MainPage() {
  const canvasRef = useRef()
  const timerRef = useRef()
  const countDownRef = useRef()
  const [ctx, setCtx] = useState()
  const app = useSelector(state => state.app)
  const { currentRoom, playerDetail } = app
  const history = useHistory()

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      let currentCtx = canvasRef.current.getContext('2d');
      if (currentCtx) {
        setCtx(currentCtx)
      }
    }

    if (ctx) {
      class Sprite {
        constructor({
          position,
          imageSrc,
          scale = 1,
          framesMax = 1,
          offset = { x: 0, y: 0 }
        }) {
          this.position = position
          this.width = 50
          this.height = 150
          this.image = new Image()
          this.image.src = imageSrc
          this.scale = scale
          this.framesMax = framesMax
          this.framesCurrent = 0
          this.framesElapsed = 0
          this.framesHold = 5
          this.offset = offset
        }
      
        draw(c) {
          c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
          )
        }
      
        animateFrames() {
          this.framesElapsed++
      
          if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
              this.framesCurrent++
            } else {
              this.framesCurrent = 0
            }
          }
        }
      
        update(c) {
          this.draw(c)
          this.animateFrames()
        }
      }
      
      class Fighter extends Sprite {
        constructor({
          position,
          velocity,
          color = 'red',
          imageSrc,
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
            imageSrc,
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

          for (const sprite in this.sprites) {
            sprites[sprite].image = new Image()
            sprites[sprite].image.src = sprites[sprite].imageSrc
          }
        }

        update(c, canvasHeight) {
          this.draw(c)
          if (!this.dead) this.animateFrames()

          // attack boxes
          this.attackBox.position.x = this.position.x + this.attackBox.offset.x
          this.attackBox.position.y = this.position.y + this.attackBox.offset.y

          // draw the attack box
          c.fillRect(
            this.attackBox.position.x,
            this.attackBox.position.y,
            this.attackBox.width,
            this.attackBox.height
          )

          this.position.x += this.velocity.x
          this.position.y += this.velocity.y

          // gravity function
          if (this.position.y + this.height + this.velocity.y >= canvasHeight - 96) {
            this.velocity.y = 0
            this.position.y = 330
          } else this.velocity.y += gravity
        }

        attack() {
          if (new Date().getTime() - this.lastTimeAttack >= this.attackSpeed) {
            this.switchSprite('attack1')
            this.isAttacking = true
            this.lastTimeAttack = new Date().getTime()
          }
        }

        takeHit(receiveAtk) {
          this.health -= Math.abs(receiveAtk - this.defense * 0.5)
          if (this.health <= 0) {
            this.switchSprite('death')
          } else {
            this.switchSprite('takeHit')
          }
        }

        switchSprite(sprite) {
          if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1)
              this.dead = true
            return
          }

          // overriding all other animations with the attack animation
          if (
            this.image === this.sprites.attack1.image &&
            this.framesCurrent < this.sprites.attack1.framesMax - 1
          )
            return

          // override when fighter gets hit
          if (
            this.image === this.sprites.takeHit.image &&
            this.framesCurrent < this.sprites.takeHit.framesMax - 1
          )
            return

          switch (sprite) {
            case 'idle':
              if (this.image !== this.sprites.idle.image) {
                this.image = this.sprites.idle.image
                this.framesMax = this.sprites.idle.framesMax
                this.framesCurrent = 0
              }
              break
            case 'run':
              if (this.image !== this.sprites.run.image) {
                this.image = this.sprites.run.image
                this.framesMax = this.sprites.run.framesMax
                this.framesCurrent = 0
              }
              break
            case 'jump':
              if (this.image !== this.sprites.jump.image) {
                this.image = this.sprites.jump.image
                this.framesMax = this.sprites.jump.framesMax
                this.framesCurrent = 0
              }
              break

            case 'fall':
              if (this.image !== this.sprites.fall.image) {
                this.image = this.sprites.fall.image
                this.framesMax = this.sprites.fall.framesMax
                this.framesCurrent = 0
              }
              break

            case 'attack1':
              if (this.image !== this.sprites.attack1.image) {
                this.image = this.sprites.attack1.image
                this.framesMax = this.sprites.attack1.framesMax
                this.framesCurrent = 0
              }
              break

            case 'takeHit':
              if (this.image !== this.sprites.takeHit.image) {
                this.image = this.sprites.takeHit.image
                this.framesMax = this.sprites.takeHit.framesMax
                this.framesCurrent = 0
              }
              break

            case 'death':
              if (this.image !== this.sprites.death.image) {
                this.image = this.sprites.death.image
                this.framesMax = this.sprites.death.framesMax
                this.framesCurrent = 0
              }
              break
          }
        }

        updateFigures(newData) {
          this.velocity = newData.velocity
          this.lastKey = newData.lastKey;
          this.isJumping = newData.isJumping;
          this.attackBox = newData.attackBox;
          this.isAttacking = newData.isAttacking;
          this.health = newData.health
          this.framesCurrent = newData.framesCurrent
          this.framesElapsed = newData.framesElapsed
          this.framesHold = newData.framesHold
          this.sprites = newData.sprites
          this.dead = newData.dead
          this.lastTimeAttack = newData.lastTimeAttack
          this.keys = newData.keys
        }
      }

      ctx.clearRect(0, 0, 1024, 576);

      background = new Sprite({
        position: {
          x: 0,
          y: 0
        },
        imageSrc: window.origin + "/img/background.png"
      })

      shop = new Sprite({
        position: {
          x: 600,
          y: 128
        },
        imageSrc: window.origin + "/img/shop.png",
        scale: 2.75,
        framesMax: 6
      })
      
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

      player = new Fighter(DEFAULT_DATA[currentRoom.players[0].champion])
      enemy = new Fighter(DEFAULT_DATA[currentRoom.players[1].champion + "Enemy"])
      
      function handleCountdown() {
        setTimeout(() => {
          if (countDownRef.current) {
            countDownRef.current.innerHTML = 'FIGHT!'
          }
          window.addEventListener('keyup', onKeyUp)
          window.addEventListener('keydown', onKeyDown)
          setTimeout(() => {
            if (countDownRef.current) {
              countDownRef.current.innerHTML = ''
            }
          }, 500)
        }, 3000)
      }

      function handleEmitAction(payload) {
        socket.emit('player_do_action', {
          ...payload,
          roomId: currentRoom.roomId,
          who: playerDetail.isHost ? 'fighter1' : 'fighter2'
        });
      }
    
      function checkOnKeyUp(key, isHost) {
        if (isHost) {
          switch (key) {
            case 'ArrowRight':
              player.keys.ArrowRight.pressed = false
              break
            case 'ArrowLeft':
              player.keys.ArrowLeft.pressed = false
              break
          }
        } else {
          switch (key) {
            case 'ArrowRight':
              enemy.keys.ArrowRight.pressed = false
              break
            case 'ArrowLeft':
              enemy.keys.ArrowLeft.pressed = false
              break
          }
        }
      }
    
      function onKeyUp(event) {
        if (isDone) return;
        checkOnKeyUp(event.key, playerDetail.isHost);
        handleEmitAction({
          key: event.key,
          type: "UP"
        })
      }
    
      function handleCheckOnkeyDown(key, player) {
        let isEmit = true
        switch (key) {
          case 'ArrowRight':
            if (!player.keys.ArrowRight.pressed) {
              player.keys.ArrowRight.pressed = true
            } else {
              isEmit = false
            }
            player.lastKey = key
            break
          case 'ArrowLeft':
            if (!player.keys.ArrowLeft.pressed) {
              player.keys.ArrowLeft.pressed = true
            } else {
              isEmit = false
            }
            player.lastKey = key
            break
          case " ":
            player.attack()
            break
          case "ArrowUp":
            if (!player.isJumping) {
              player.isJumping = true
              setTimeout(() => {
                player.isJumping = false
              }, 800)
              player.velocity.y = -15
            }
            break
        }
        return isEmit
      }
    
      function checkOnKeyDown(key, isHost) {
        let isEmit = true
        if (isHost) {
          isEmit = handleCheckOnkeyDown(key, player)
        } else {
          isEmit = handleCheckOnkeyDown(key, enemy)
        }
        return isEmit
      }
    
      function onKeyDown(event) {
        if (isDone) return;
        const isEmit = checkOnKeyDown(event.key, playerDetail.isHost)
        if (isEmit) {
          handleEmitAction({
            key: event.key,
            type: "DOWN"
          })
        }
      }
      
      async function handleStartGame() {
        handleCountdown()
      }

      async function setStateFighter({ key, type, who }) {
        if (playerDetail.isHost && who === 'fighter2') {
          // update enemy
          if (type === "UP") {
            checkOnKeyUp(key, false)
          } else if (type === "DOWN") {
            checkOnKeyDown(key, false)
          }
        } else if (!playerDetail.isHost && who === 'fighter1') {
          // up date player
          if (type === "UP") {
            checkOnKeyUp(key, true)
          } else if (type === "DOWN") {
            checkOnKeyDown(key, true)
          }
        }
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

      function checkMovement(player) {
        if (player.keys.ArrowLeft.pressed && player.lastKey === 'ArrowLeft') {
          if (player.position.x <= player.minX) {
            player.position.x = player.minX + 1
            player.velocity.x = 0
          } else {
            player.velocity.x = -5
          }
          player.switchSprite('run')
        } else if (player.keys.ArrowRight.pressed && player.lastKey === 'ArrowRight') {
          if (player.position.x >= player.maxX) {
            player.position.x = player.maxX - 1
            player.velocity.x = 0
          } else {
            player.velocity.x = 5
          }
          player.switchSprite('run')
        } else {
          player.velocity.x = 0
          player.switchSprite('idle')
        }

        // jumping
        if (player.velocity.y < 0 && (player && !player.isJumping)) {
          player.switchSprite('jump')
          player.isJumping = true
        } else if (player.velocity.y > 0) {
          player.switchSprite('fall')
        }
      }

      function checkCollisionAndGetsHit(player, enemy, id) {
        // detect for collision & enemy gets hit
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
          }) &&
          player.isAttacking &&
          player.framesCurrent === 4
        ) {
          enemy.takeHit(player.damage)
          player.isAttacking = false
          gsap.to(id, {
            width: (enemy.health / enemy.hp * 100) + '%'
          })
        }

        // if player misses
        if (player.isAttacking && player.framesCurrent === 4) {
          player.isAttacking = false
        }
      }
          
      async function checkPlayerAction() {
        if (!player || !enemy) {
          return;
        }
        checkMovement(playerDetail.isHost ? player : enemy);
        checkMovement(playerDetail.isHost ? enemy : player);

        checkCollisionAndGetsHit(
          playerDetail.isHost ? player : enemy,
          playerDetail.isHost ? enemy : player,
          playerDetail.isHost ? "#enemyHealth" : "#playerHealth"
        );
        checkCollisionAndGetsHit(
          playerDetail.isHost ? enemy : player,
          playerDetail.isHost ? player : enemy,
          playerDetail.isHost ? "#playerHealth" : "#enemyHealth"
        );

        // end game based on health
        if (player.health <= 0 || enemy.health <= 0) {
          if (!isDone) {
            determineWinner()
            handleGameOver()
          }
        }
      }

      function determineWinner() {
        if (timerRef.current) {
          timerRef.current.innerHTML = 0
        }
        let displayTextEl = document.getElementById('displayText');
        if (!displayTextEl) return;

        if (
          player.health === player.hp &&
          enemy.health === enemy.hp
        ) {
          displayTextEl.innerHTML = "Tie"
        } else if (player.health > enemy.health) {
          displayTextEl.innerHTML = currentRoom.players[0].playerName + ' win!'
        } else if (player.health < enemy.health) {
          displayTextEl.innerHTML = currentRoom.players[1].playerName + ' win!';
        }
      }

      async function animate() {
        requestAnimationFrameId = requestAnimationFrame(animate)
        ctx.fillRect(0, 0, 1024, 576)
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, 1024, 576)
        background.update(ctx)
        shop.update(ctx)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.fillRect(0, 0, 1024, 576)
        if (player && enemy) {
          player.update(ctx, 576)
          enemy.update(ctx, 576)
          player.velocity.x = 0
          enemy.velocity.x = 0
          if (isDone) {
            player.velocity.x = 0;
            player.isAttacking = false;
            player.isJumping = false;
            player.switchSprite('idle')
            
            enemy.velocity.x = 0;
            enemy.isAttacking = false;
            enemy.isJumping = false;
            enemy.switchSprite('idle')
          } else {
            checkPlayerAction()
          }
        }
      }

      requestAnimationFrameId = requestAnimationFrame(animate);

      socket.emit('player_load_completely', {
        roomId: currentRoom.roomId,
        playerIndex: playerDetail.isHost ? 0 : 1
      })

      socket.on('start_game', handleStartGame)
      socket.on('receive_action', setStateFighter)

      function handleGameOver() {
        console.log('gameOver')
        socket.emit('battle_off', {
          roomId: currentRoom.roomId
        })
        window.removeEventListener('keyup', onKeyUp, true)
        window.removeEventListener('keydown', onKeyDown, true)
        player.velocity.x = 0;
        player.isAttacking = false;
        player.isJumping = false;
        player.update(ctx, 576);

        enemy.velocity.x = 0;
        enemy.isAttacking = false;
        enemy.isJumping = false;
        enemy.update(ctx, 576);

        isDone = true

        setTimeout(() => {
          history.push('/waiting-room')
        }, 2000)
      }

      socket.on('game_over', () => {
        determineWinner()
        handleGameOver()
      })

      socket.on('battle_update', (res) => {
        if (timerRef.current) {
          timerRef.current.innerHTML = res
        }
      })
    }
    console.log('use effect')
    return () => {
      console.log('use effect clean up')
      cancelAnimationFrame(requestAnimationFrameId)
      player = null
      enemy = null
      shop = null
      background = null
      isDone = false
      socket.off('start_game')
      socket.off('receive_action')
      socket.off('game_over')
      socket.off('battle_update')
    }
  }, [ctx])

  return (
    <>
      <img src={window.origin + '/img/background_full.png'} />
      <div className='main_page_container'>
        <div className='fight_screen' style={{
          backgroundImage: `url(${window.origin + "/img/outline.png"}`
        }}>
          <div className='outline'>
            <div className='health'>
              <div className='lose_health'></div>
              <div id="playerHealth"></div>
            </div>

            <div ref={timerRef} id="timer">10</div>
            <div className='health'>
              <div className='lose_health'></div>
              <div id="enemyHealth"></div>
            </div>
            <div></div>
          </div>
          <div id="displayText">Tie</div>
          <div
            id="startGame"
            onClick={(e) => {
              e.preventDefault()
              if (isDone) {
                history.replace('/waiting-room')
              }
            }}
            style={{
              display: (!isDone) ? 'none' : 'block',
              marginTop: (!isDone) ? 'auto' : '30%'
            }}
          >
            <div>
              <img width="270" height="110" src={window.origin + "/img/fight.png"} />
              <p className='h5'>{isDone ? "Back to room" : "Wait for enemy"}</p>
            </div>
          </div>
          <canvas width={1024} height={576} ref={canvasRef}></canvas>
        </div>
      </div>
      <div ref={countDownRef} className="timeStart" />
    </>
  )
}

export default MainPage
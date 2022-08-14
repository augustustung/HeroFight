import React, { useEffect, useRef } from 'react'
import "./App.scss"
import Sprite from './oop/Sprite';
import Fighter from './oop/Fighter';
import gsap from 'gsap';
import Hero from './oop/champ/hero.json';
import SamuraiMackEnemy from './oop/champ/samuraiMackEnemy.json';


const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: window.origin + "/img/background.png"
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: window.origin + "/img/shop.png",
  scale: 2.75,
  framesMax: 6
})

let timerId
let timer = 60
let player = new Fighter(Hero)
let enemy = new Fighter(SamuraiMackEnemy)
let requestAnimationFrameId
function App() {

  const canvasRef = useRef()
  const timerRef = useRef()
  const countDownRef = useRef()

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      animate()
    }
    return () => {
      window.cancelAnimationFrame(requestAnimationFrameId)
    }
  }, [canvasRef])

  async function animate() {
    requestAnimationFrameId = window.requestAnimationFrame(animate)
    const c = await canvasRef.current.getContext('2d')
    c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    const canvas = canvasRef.current
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update(c)
    shop.update(c)
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    if (player && enemy) {
      player.update(c, canvas)
      enemy.update(c, canvas)
      player.velocity.x = 0
      enemy.velocity.x = 0
      checkPlayerAction()
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

  function determineWinner() {
    timerRef.current.innerHTML = 0
    document.getElementById('displayText').style.display = "flex"
    if (
      player.health === player.hp &&
      enemy.health === enemy.hp
    ) {
      document.getElementById('displayText').innerHTML = "Tie"
    } else if (player.health > enemy.health) {
      document.getElementById('displayText').innerHTML = 'Player 1 win!'
    } else if (player.health < enemy.health) {
      document.getElementById('displayText').innerHTML = 'Player 2 win!';
    }
    window.removeEventListener('keyup', null)
    window.removeEventListener('keydown', null)
    player.velocity.x = 0;
    enemy.velocity.x = 0;
    window.cancelAnimationFrame(requestAnimationFrameId)
  }

  async function checkPlayerAction() {
    if (!player || !enemy) {
      return;
    }
    checkMovement(player);
    checkMovement(enemy);

    checkCollisionAndGetsHit(
      player,
      enemy,
      "#enemyHealth"
    );
    checkCollisionAndGetsHit(
      enemy,
      player,
      "#playerHealth"
    );

    // end game based on health
    if (player.health <= 0 || enemy.health <= 0) {
      determineWinner()
    }
  }


  function decreaseTimer() {
    if (timer > 0) {
      timerId = setTimeout(decreaseTimer, 1000)
      timer--
      document.querySelector('#timer').innerHTML = timer
    }

    if (timer === 0) {
      determineWinner({ player, enemy, timerId })
    }
  }

  function startGame() {
    decreaseTimer()

    window.addEventListener('keydown', (event) => {
      if (!player.dead) {
        switch (event.key) {
          case 'd':
            player.keys.d.pressed = true
            player.lastKey = 'd'
            break
          case 'a':
            player.keys.a.pressed = true
            player.lastKey = 'a'
            break
          case 'w':
            if (!player.isJumping) {
              player.isJumping = true;
              player.velocity.y = -20;
              setTimeout(() => { player.isJumping = false }, 1000)
            }
            break
          case ' ':
            player.attack()
            break
        }
      }

      if (!enemy.dead) {
        switch (event.key) {
          case 'ArrowRight':
            enemy.keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break
          case 'ArrowLeft':
            enemy.keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break
          case 'ArrowUp':
            if (!enemy.isJumping) {
              enemy.velocity.y = -20;
              enemy.isJumping = true;
              setTimeout(() => { enemy.isJumping = false }, 1000)
            }
            break;
          case 'ArrowDown':
            enemy.attack()
            break
        }
      }
    })

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'd':
          player.keys.d.pressed = false
          break
        case 'a':
          player.keys.a.pressed = false
          break
      }

      // enemy keys
      switch (event.key) {
        case 'ArrowRight':
          enemy.keys.ArrowRight.pressed = false
          break
        case 'ArrowLeft':
          enemy.keys.ArrowLeft.pressed = false
          break
      }
    })
  }

  useEffect(() => {
    startGame();
    return () => {
      clearTimeout(timerId)
    }
  }, [])

  return (
    <>
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
          {/* <div
            id="startGame"
            onClick={(e) => {
              e.preventDefault()
              window.location.reload()
            }}
            style={{
              display: (!isDone && isStart) ? 'none' : 'block',
              marginTop: (!isDone && isStart) ? 'auto' : '30%'
            }}
          >
            <div>
              <img width="270" height="110" src={window.origin + "/img/fight.png"} />
            </div>
          </div> */}
          <canvas width={1024} height={576} ref={canvasRef}></canvas>
        </div>
      </div>
      <div ref={countDownRef} className="timeStart" />
    </>
  )
}

export default App
import React, { useEffect, useRef, useState } from 'react'
import "./main_page.scss"
import Sprite from '../../oop/Sprite';
import Fighter from '../../oop/Fighter';
import Hero from '../../oop/champ/hero.json'
import HeroEnemy from '../../oop/champ/heroEnemy.json'
import WarrirorEnemy from '../../oop/champ/warrirorEnemy.json'
import SamuraiMackEnemy from '../../oop/champ/samuraiMackEnemy.json'
import gsap from 'gsap';

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

const player = new Fighter(Hero)

const enemy = new Fighter(SamuraiMackEnemy)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

let timer = 60
let timerId

function MainPage() {
  const canvasRef = useRef()
  const timerRef = useRef()
  const [isStart, setIsStart] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const c = canvasRef.current.getContext('2d')
      c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      animate()
    }
  }, [canvasRef])

  async function animate() {
    const c = await canvasRef.current.getContext('2d')
    const canvas = canvasRef.current
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update(c)
    shop.update(c)
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update(c, canvas)
    enemy.update(c, canvas)

    player.velocity.x = 0
    enemy.velocity.x = 0

    // player movement

    if (keys.a.pressed && player.lastKey === 'a') {
      console.log(player.position.x);

      // if (player.position.x <= 10 || player.isAttacking) {
      //   player.velocity.x = 0;
      // } else {
      player.velocity.x = -5;
      // }
      player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
      console.log(player.position.x);

      // if (player.position.x >= 940 || player.isAttacking) {
      //   player.velocity.x = 0;
      // } else {
      player.velocity.x = 5;
      // }
      player.switchSprite('run')
    } else {
      player.switchSprite('idle')
    }

    // jumping
    if (player.velocity.y < 0) {
      player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
      player.switchSprite('fall')
    }

    // Enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
      console.log(enemy.position.x);
      if (enemy.position.x <= 10 || enemy.isAttacking) {
        enemy.velocity.x = 0;
      } else {
        enemy.velocity.x = -5;
      }
      enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
      console.log(enemy.position.x);

      if (enemy.position.x >= 940 || enemy.isAttacking) {
        enemy.velocity.x = 0;
      } else {
        enemy.velocity.x = 5;
      }
      enemy.switchSprite('run')
    } else {
      enemy.switchSprite('idle')
    }

    // jumping
    if (enemy.velocity.y < 0) {
      enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
      enemy.switchSprite('fall')
    }

    // detect for collision & enemy gets hit
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: enemy
      }) &&
      player.isAttacking &&
      player.framesCurrent === 4
    ) {
      enemy.takeHit()
      player.isAttacking = false

      gsap.to('#enemyHealth', {
        width: enemy.health + '%'
      })
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
      player.isAttacking = false
    }

    // this is where our player gets hit
    if (
      rectangularCollision({
        rectangle1: enemy,
        rectangle2: player
      }) &&
      enemy.isAttacking &&
      enemy.framesCurrent === 2
    ) {
      player.takeHit()
      enemy.isAttacking = false

      gsap.to('#playerHealth', {
        width: player.health + '%'
      })
    }

    // if player misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
      enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
      window.removeEventListener('keydown', playerAction)
      window.removeEventListener('keyup', enemyAction)
      determineWinner({ player, enemy, timerId })
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

  function determineWinner({ player, enemy, timerId }) {
    clearTimeout(timerId);
    document.querySelector('#displayText').style.display = 'flex'
    if (player.health === enemy.health) {
      document.querySelector('#displayText').innerHTML = 'Tie'
    } else if (player.health > enemy.health) {
      document.querySelector('#displayText').innerHTML = 'Player 1 Wins'
    } else if (player.health < enemy.health) {
      document.querySelector('#displayText').innerHTML = 'Player 2 Wins'
    }
    window.removeEventListener('keydown', playerAction)
    window.removeEventListener('keyup', enemyAction)
    player.velocity.x = 0
    enemy.velocity.x = 0
    setIsDone(true)
  }

  function decreaseTimer() {
    if (timer > 0) {
      timerId = setTimeout(decreaseTimer, 1000)
      timer--
      timerRef.current.innerHTML = timer
    }

    if (timer === 0) {
      determineWinner({ player, enemy, timerId })
    }
  }

  function playerAction(event) {
    if (!player.dead) {
      switch (event.key) {
        case 'd':
          keys.d.pressed = true
          player.lastKey = 'd'
          break
        case 'a':
          keys.a.pressed = true
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
          keys.ArrowRight.pressed = true
          enemy.lastKey = 'ArrowRight'
          break
        case 'ArrowLeft':
          keys.ArrowLeft.pressed = true
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
  }

  function enemyAction(event) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = false
        break
      case 'a':
        keys.a.pressed = false
        break
    }

    // enemy keys
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = false
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = false
        break
    }
  }

  function startGame(e) {
    e.preventDefault();
    if (isStart) { return; }
    decreaseTimer()

    window.addEventListener('keydown', playerAction)
    window.addEventListener('keyup', enemyAction)

    setIsStart(true)
  }

  function resetGame() {
    window.location.reload()
  }

  return (
    <div className='main_page_container' style={{
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
      <div id="displayText">
        Tie
      </div>
      <div
        id="startGame"
        onClick={(e) => {
          isDone ?
            resetGame(e) :
            startGame(e)
        }}
        style={{
          display: (!isDone && isStart) ? 'none' : 'block',
          marginTop: (!isDone && isStart) ? 'auto' : '32%'
        }}
      >
        <div>
          <img width="270" height="110" src={window.origin + "/img/fight.png"} />
          <p>{isDone ? "Back to room" : "Play"}</p>
        </div>
      </div>
      <canvas width={1024} height={576} ref={canvasRef}></canvas>
    </div>

  )
}

export default MainPage
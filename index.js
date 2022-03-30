const canvas = document.querySelector('canvas')
const buttonPlay = document.querySelector("#startGame")
const c = canvas.getContext('2d')

let isStart = false;

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  "position": {
    "x": 306.5,
    "y": 0
  },
  "velocity": {
    "x": 0,
    "y": 0
  },
  "imageSrc": "./img/samuraiMack/Idle.png",
  "framesMax": 8,
  "scale": 2.5,
  "offset": {
    "x": 215,
    "y": 157
  },
  "sprites": {
    "idle": {
      "imageSrc": "./img/samuraiMack/Idle.png",
      "framesMax": 8
    },
    "run": {
      "imageSrc": "./img/samuraiMack/Run.png",
      "framesMax": 8
    },
    "jump": {
      "imageSrc": "./img/samuraiMack/Jump.png",
      "framesMax": 2
    },
    "fall": {
      "imageSrc": "./img/samuraiMack/Fall.png",
      "framesMax": 2
    },
    "attack1": {
      "imageSrc": "./img/samuraiMack/Attack1.png",
      "framesMax": 6
    },
    "takeHit": {
      "imageSrc": "./img/samuraiMack/Take Hit - white silhouette.png",
      "framesMax": 4
    },
    "death": {
      "imageSrc": "./img/samuraiMack/Death.png",
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
  }
})

const enemy = new Fighter({
  position: {
    x: 626.5,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
})

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


function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    if (player.position.x <= 10 || player.isAttacking) {
      player.velocity.x = 0;
    } else {
      player.velocity.x = -5;
    }
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    if (player.position.x >= 940 || player.isAttacking) {
      player.velocity.x = 0;
    } else {
      player.velocity.x = 5;
    }
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
    if (enemy.position.x <= 10 || enemy.isAttacking) {
      enemy.velocity.x = 0;
    } else {
      enemy.velocity.x = -5;
    }
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
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
    window.removeEventListener('keydown', null);
    determineWinner({ player, enemy, timerId })
  }
}

animate()

buttonPlay.addEventListener('click', startGame)

window.addEventListener('keydown', startGame)
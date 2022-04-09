import Sprite from "./Sprite"

const gravity = 0.7

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

  update(c, canvas) {
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
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
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

export default Fighter;
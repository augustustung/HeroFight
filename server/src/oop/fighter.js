const Sprite = require("./sprite");

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
    hp,
    lastTimeAttack,
    keys,
    dead
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
    this.attackBox = attackBox
    this.color = color
    this.isAttacking = false;
    this.health = hp
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 5
    this.sprites = sprites
    this.dead = dead
    this.lastTimeAttack = lastTimeAttack
    this.attackSpeed = attackSpeed
    this.damage = damage
    this.defense = defense
    this.hp = hp
    this.keys = keys
  }
}

module.exports = Fighter;
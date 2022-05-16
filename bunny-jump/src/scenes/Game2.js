import Carrot2 from '../game/Carrot2.js'
import Phaser from '../lib/phaser.js'

export default class Game2 extends Phaser.Scene {
  carrotsCollected = 0

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms

  /** @type {Phaser.Physics.Arcade.Group} */
  carrots

  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors

  /** @type {Phaser.GameObjects.Text} */
  carrotsCollectedText

  constructor() {
    super('game')
  }

  init() {
    this.carrotsCollected = 0
  }

  preload() {
    this.load.image('background', 'assets/bg_layer1.png')

    this.load.image('platform', 'assets/ground_grass.png')

    this.load.image('bunny-stand', 'assets/bunny1_stand.png')

    this.load.image('carrot', 'assets/carrot.png')

    this.load.image('bunny-jump', 'assets/bunny1_jump.png')

    this.load.audio('jump', 'assets/sfx/highUp.ogg')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.add.image(240, 320, 'background').setScrollFactor(1, 0)

    this.platforms = this.physics.add.staticGroup()

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400)
      const y = 150 * i

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, 'platform')
      platform.scale = 0.5

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body
      body.updateFromGameObject()
    }

    this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5)
    this.carrots = this.physics.add.group({
      classType: Carrot2,
    })

    this.physics.add.collider(this.platforms, this.player)
    this.physics.add.collider(this.platforms, this.carrots)
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined,
      this,
    )

    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.left = false
    this.player.body.checkCollision.right = false

    this.cameras.main.startFollow(this.player)
    this.cameras.main.setDeadzone(this.scale.width * 1.5)

    const style = {
      color: '#000',
      font: '900 2rem Poppins',
      color: 'red',
    }

    this.carrotsCollectedText = this.add
      .text(240, 10, 'Carrots: 0', style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0)
  }

  update() {
    const touchingDown = this.player.body.touching.down

    if (touchingDown) {
      this.player.setVelocityY(-300)
      this.player.setTexture('bunny-jump')
    }

    const vy = this.player.body.velocity.y
    if (vy > 0 && this.player.texture.key !== 'bunny-stand') {
      this.player.setTexture('bunny-stand')
    }

    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child

      const scrollY = this.cameras.main.scrollY
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100)
        platform.body.updateFromGameObject()

        this.addCarrotAbove(platform)
      }
    })

    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200)
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200)
    } else {
      this.player.setVelocityX(0)
    }
  }

  /**
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Carrot2} carrot
   */
  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot)
    this.physics.world.disableBody(carrot.body)

    this.carrotsCollected++

    const value = `Carrots: ${this.carrotsCollected}`
    this.carrotsCollectedText.text = value
  }

  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, y, 'carrot')
    carrot.enableBody(true, sprite.x, y, true, true)
    this.add.existing(carrot)
    carrot.body.setSize(carrot.width, carrot.height)
    this.physics.world.enable(carrot)
    return carrot
  }
}

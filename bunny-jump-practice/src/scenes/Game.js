import Carrot from '../game/Carrot.js'
import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene {
  /**@type {Phaser.Physics.Arcade.Sprite} */
  player

  /**@type {Phaser.Physics.Arcade.StaticGroup} */
  platforms

  /**@type {Phaser.Physics.Arcade.Group} */
  carrots

  /**@type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursor

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('background', 'assets/bg_layer1.png')
    this.load.image('platform', 'assets/ground_grass.png')
    this.load.image('bunny-stand', 'assets/bunny1_stand.png')
    this.load.image('carrot', 'assets/carrot.png')
    this.cursor = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.add.image(240, 320, 'background').setScrollFactor(1, 0)
    this.platforms = this.physics.add.staticGroup()

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400)
      const y = i * 150

      /**@type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, 'platform')
      platform.scale = 0.5

      /**@type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body
      body.updateFromGameObject()
    }

    this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
    this.player.scale = 0.5
    this.carrots = this.physics.add.group({
      classType: Carrot,
    })

    // this.carrots.get(240, 320, 'carrot')
    this.physics.add.collider(this.platforms, this.carrots)
    this.physics.add.collider(this.platforms, this.player)
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined,
      this,
    )

    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.right = false
    this.player.body.checkCollision.left = false

    this.cameras.main.startFollow(this.player)
    this.cameras.main.setDeadzone(this.scale.width * 1.5)
  }

  update() {
    const touchingDown = this.player.body.touching.down

    if (touchingDown) {
      this.player.setVelocityY(-300)
    }

    this.platforms.children.iterate((child) => {
      /**@type {Phaser.Physics.Arcade.Sprite} */
      const platform = child

      const scrollY = this.cameras.main.scrollY
      console.log(scrollY)
      console.log(platform.y)
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100)
        this.addCarrotAbove(platform)
        platform.body.updateFromGameObject()
      }
    })

    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-200)
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(200)
    } else {
      this.player.setVelocityX(0)
    }
  }

  /**
   * @param {Phaser.GameObject.Sprite} sprite
   */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight
    /** @type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, y, 'carrot')

    carrot.setActive(true)
    carrot.setVisible(true)

    this.add.existing(carrot)

    carrot.body.setSize(carrot.width, carrot.height)

    this.physics.world.enable(carrot)

    return carrot
  }

  /**
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Carrot} carrot
   */
  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot)
    this.physics.world.disableBody(carrot.body)
  }
}

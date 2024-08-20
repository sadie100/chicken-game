export class Egg extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "egg");
        this.damage = 1; // 기본 데미지 값
    }

    fire(x, y, speed) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityX(speed);
    }

    update(time, delta) {
        if (this.x > this.scene.game.config.width) {
            this.destroy();
        }
    }
}

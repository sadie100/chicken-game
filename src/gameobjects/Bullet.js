import Phaser from "phaser";

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy-bullet");
    }

    fire(x, y, velocityX, velocityY) {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocity(velocityX, velocityY);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (
            this.y <= 0 ||
            this.y >= this.scene.scale.height ||
            this.x <= 0 ||
            this.x >= this.scene.scale.width
        ) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

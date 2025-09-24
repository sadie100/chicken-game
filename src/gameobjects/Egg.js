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

    fireWithAngle(x, y, speed, angleDeg) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        const rad = Phaser.Math.DegToRad(angleDeg);
        const vx = Math.cos(rad) * speed;
        const vy = Math.sin(rad) * speed;
        this.setVelocity(vx, vy);
    }

    update(time, delta) {
        if (this.x > this.scene.game.config.width) {
            this.destroy();
        }
    }
}

export class Monster extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5);
        this.setFlipX(true);
        this.isStunned = false;
        this.body.setSize(this.width * 0.5, this.height * 0.5);
        this.body.setOffset(this.width * 0.25, this.height * 0.5);
    }

    update(time, delta) {}

    hit(damage) {
        this.health -= damage;
        console.log(
            `${this.constructor.name} hit. Remaining health:`,
            this.health
        );

        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
        });

        if (this.health <= 0) {
            console.log(`${this.constructor.name} destroyed`);
            this.destroy();
        } else {
            this.stun();
        }
    }

    stun() {
        if (!this.isStunned) {
            this.isStunned = true;
            this.setTint(0x0000ff);

            this.scene.time.delayedCall(this.stunDuration, () => {
                this.isStunned = false;
                this.clearTint();
            });
        }
    }

    destroy(fromScene) {
        // 부모 클래스의 destroy 메서드 호출
        super.destroy(fromScene);
    }
}


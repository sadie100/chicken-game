import { Physics } from "phaser";

export class Monster extends Phaser.Physics.Arcade.Sprite {
    speed = 100;
    health = 3;
    isStunned = false;
    stunDuration = 1000; // 1초간 기절
    direction = 0; // y축 이동 각도

    constructor(scene, x, y, texture, speed, direction) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5);
        this.setFlipX(true);
        this.setScale(2);
        this.direction = direction; // y축 이동 각도 설정
        this.isStunned = false;
        this.body.setSize(this.width * 0.5, this.height * 0.5);
        this.body.setOffset(this.width * 0.25, this.height * 0.5);
        this.speed = speed || this.speed;
    }

    update(time, delta) {
        if (!this.isStunned) {
            // x축 이동 (항상 왼쪽으로)
            const dx = -this.speed * (delta / 1000);

            this.x += dx;

            const dy = this.speed * (delta / 1000) * Math.random();
            // y축 이동 (각도에 따라 위 또는 아래로)
            if (this.direction === "down") {
                this.y += dy;
            } else if (this.direction === "up") {
                this.y -= dy;
            }
        }

        if (
            this.x < -this.width ||
            this.x > this.scene.scale.width + this.width ||
            this.y < -this.height ||
            this.y > this.scene.scale.height + this.height
        ) {
            this.destroy();
        }
    }

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


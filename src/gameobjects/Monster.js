import { Physics } from "phaser";

export class Monster extends Physics.Arcade.Sprite {
    speed = 100;
    health = 3;
    isStunned = false;
    stunDuration = 1000; // 1초간 기절

    constructor(scene, x, y) {
        super(scene, x, y, "monster");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(2);
        this.setFlipX(true);

        // 충돌 영역 조정
        this.body.setSize(this.width * 0.5, this.height * 0.5); // 크기를 원본의 60%로 조정
        this.body.setOffset(this.width * 0.25, this.height * 0.5); // 오프셋 설정

        if (this.scene.anims.exists("monster_walk")) {
            this.play("monster_walk");
        }
    }

    hit(damage) {
        this.health -= damage;
        console.log("Monster hit. Remaining health:", this.health);

        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
        });

        if (this.health <= 0) {
            console.log("Monster destroyed");
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

    update(time, delta) {
        if (!this.isStunned) {
            this.x -= this.speed * (delta / 1000);
        }

        if (this.x < -this.width) {
            this.destroy();
        }
    }
}


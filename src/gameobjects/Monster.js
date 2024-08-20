import { Physics } from "phaser";

export class Monster extends Physics.Arcade.Sprite {
    speed = 100;
    health = 3; // 몬스터의 초기 체력
    isStunned = false;
    stunDuration = 1000; // 1초간 기절

    constructor(scene, x, y) {
        super(scene, x, y, "monster");
        console.log("Monster created with health:", this.health); // 디버깅용 로그 추가
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.setFlipX(true);
        this.body.setSize(20, 20);

        if (this.scene.anims.exists("monster_walk")) {
            this.play("monster_walk");
        }
    }

    hit(damage) {
        this.health -= damage;
        console.log("Monster hit. Remaining health:", this.health); // 디버깅용 로그 추가
        // Flash the monster red when hit
        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
        });

        if (this.health <= 0) {
            console.log("Monster destroyed"); // 디버깅용 로그 추가
            this.destroy();
        } else {
            this.stun();
        }
    }

    stun() {
        if (!this.isStunned) {
            this.isStunned = true;
            this.setTint(0x0000ff); // Blue tint to indicate stun

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

        // Remove the monster if it goes off screen
        if (this.x < -this.width) {
            this.destroy();
        }
    }
}


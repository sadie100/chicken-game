import { Physics } from "phaser";

export class Cat extends Physics.Arcade.Sprite {
    speed = 100;
    health = 3;
    isStunned = false;
    stunDuration = 2000; // 2 seconds

    constructor(scene, x, y) {
        super(scene, x, y, "cat");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.body.setSize(20, 20); // Adjust hitbox size as needed
    }

    hit(damage) {
        this.health -= damage;

        // Flash the cat red when hit
        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
        });

        if (this.health <= 0) {
            this.destroy();
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

            // Remove the cat if it goes off screen
            if (this.x < -this.width) {
                this.destroy();
            }
        }
    }
}

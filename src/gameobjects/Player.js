import { Physics } from "phaser";
import { Egg } from "./Egg";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    eggs = null;
    isMoving = false;
    lives = 5;
    isInvulnerable = false;

    constructor({ scene }) {
        super(scene, 200, scene.scale.height - 100, "chicken_idle");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(2);

        // 충돌 영역 조정
        this.body.setSize(this.width * 0.3, this.height * 0.5); // 크기를 원본의 50%로 조정
        this.body.setOffset(this.width * 0.35, this.height * 0.5); // 오프셋 설정

        this.eggs = this.scene.physics.add.group({
            classType: Egg,
            maxSize: 100,
            runChildUpdate: true,
        });

        this.playIdleAnimation();
    }

    playIdleAnimation() {
        this.play("chicken_idle", true);
    }

    playWalkAnimation() {
        this.play("chicken_walk", true);
    }

    fire() {
        const egg = this.eggs.get();
        if (egg) {
            egg.fire(this.x, this.y, 400); // 400은 egg의 속도입니다. 필요에 따라 조정하세요.
            egg.body.onWorldBounds = true; // 월드 경계에 도달했을 때 이벤트를 활성화합니다.
            egg.body.world.on("worldbounds", (body) => {
                if (body.gameObject === egg) {
                    egg.destroy();
                }
            });
        }
    }

    move(direction) {
        const speed = 5;
        let moved = false;

        switch (direction) {
            case "up":
                if (this.y - speed > 0) {
                    this.y -= speed;
                    moved = true;
                }
                break;
            case "down":
                if (this.y + this.height + speed < this.scene.scale.height) {
                    this.y += speed;
                    moved = true;
                }
                break;
            case "left":
                if (this.x - speed > 0) {
                    this.x -= speed;
                    moved = true;
                    this.setFlipX(true);
                }
                break;
            case "right":
                if (this.x + this.width + speed < this.scene.scale.width) {
                    this.x += speed;
                    moved = true;
                    this.setFlipX(false);
                }
                break;
        }

        if (moved) {
            this.playWalkAnimation();
        } else {
            this.playIdleAnimation();
        }
    }

    update() {
        // Update logic if needed
    }

    loseLife() {
        if (this.isInvulnerable) return this.lives;

        this.lives--;
        this.flashRed();
        return this.lives;
    }

    flashRed() {
        this.isInvulnerable = true;
        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.clearTint();
                this.isInvulnerable = false;
            },
        });
    }

    isInvulnerable() {
        return this.isInvulnerable;
    }

    getLives() {
        return this.lives;
    }
}


import { Physics } from "phaser";
import { Egg } from "./Egg";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    eggs = null;
    isMoving = false;
    lives = 5;
    isInvulnerable = false;
    realWidth = 0;
    realHeight = 0;
    speed = 200; // 속도를 픽셀/초 단위로 정의

    constructor({ scene }) {
        super(scene, 200, scene.scale.height - 100, "chicken_idle");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(2);

        // 충돌 영역 설정 (원래대로 유지)
        this.body.setSize(this.width * 0.3, this.height * 0.5);
        this.body.setOffset(this.width * 0.35, this.height * 0.5);

        // 실제 플레이어 크기 계산
        this.realWidth = this.width * 0.3;
        this.realHeight = this.height * 0.5;

        this.eggs = this.scene.physics.add.group({
            classType: Egg,
            maxSize: 100,
            runChildUpdate: true,
        });

        this.playIdleAnimation();
    }

    fire() {
        const egg = this.eggs.get();
        if (egg) {
            // 닭의 y축 중간 지점 계산
            const middleY = this.y + this.height / 2.5; // this.height / 4는 실제 높이의 중간점 (스케일이 2이므로)
            egg.fire(this.x, middleY, 400);
            egg.body.onWorldBounds = true;
            egg.body.world.on("worldbounds", (body) => {
                if (body.gameObject === egg) {
                    egg.destroy();
                }
            });
        }
    }

    move(directions, delta) {
        let dx = 0;
        let dy = 0;

        if (directions.includes("up")) {
            dy -= 1;
        }
        if (directions.includes("down")) {
            dy += 1;
        }
        if (directions.includes("left")) {
            dx -= 1;
        }
        if (directions.includes("right")) {
            dx += 1;
        }

        // 대각선 이동 시 속도 정규화
        if (dx !== 0 && dy !== 0) {
            const factor = Math.sqrt(2) / 2;
            dx *= factor;
            dy *= factor;
        }

        // delta를 이용한 시간 기반 이동
        const pixelsToMoveX = dx * this.speed * (delta / 1000);
        const pixelsToMoveY = dy * this.speed * (delta / 1000);

        // 새로운 위치 계산
        let newX = this.x + pixelsToMoveX;
        let newY = this.y + pixelsToMoveY;

        // 화면 경계 검사
        newX = Phaser.Math.Clamp(
            newX,
            0,
            this.scene.scale.width - this.realWidth
        );
        newY = Phaser.Math.Clamp(
            newY,
            0,
            this.scene.scale.height - this.realHeight
        );

        // 위치 업데이트
        this.setPosition(newX, newY);

        if (dx !== 0 || dy !== 0) {
            this.playWalkAnimation();
        } else {
            this.playIdleAnimation();
        }
    }

    playIdleAnimation() {
        this.play("chicken_idle", true);
    }

    playWalkAnimation() {
        this.play("chicken_walk", true);
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


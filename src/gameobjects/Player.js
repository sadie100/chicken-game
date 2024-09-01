import { Physics } from "phaser";
import { Egg } from "./Egg";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    eggs = null;
    isMoving = false;
    heldItem = null;
    lives = 5;
    isInvulnerable = false;
    realWidth = 0;
    realHeight = 0;
    speed = 200;
    baseSpeed = 200;
    baseBulletDamage = 1;
    baseBulletSpeed = 400;
    bulletDamage = 1;
    bulletSpeed = 400;
    baseEggSize = 1;
    eggSize = 1;
    fireDelay = 200; // 0.2초 간격으로 발사
    fireTimer = 0;

    constructor({ scene }) {
        super(scene, 100, scene.scale.height / 2, "chicken_idle");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(3);

        this.body.setSize(this.width * 0.3, this.height * 0.5);
        this.body.setOffset(this.width * 0.35, this.height * 0.5);

        this.realWidth = this.width * 0.3;
        this.realHeight = this.height * 0.5;

        this.eggs = this.scene.physics.add.group({
            classType: Egg,
            maxSize: 100,
            runChildUpdate: true,
        });

        this.playIdleAnimation();
        this.setData("canMove", true);

        // 스턴 관련 변수
        this.canStun = false;
        this.stunDuration = 2000; // 2초간 스턴

        this.soundManager = this.scene.game.registry.get("soundManager");
    }

    updateCooldown(delta) {
        if (this.fireTimer > 0) {
            this.fireTimer -= delta;
            return; // 발사 간격이 지나지 않았으면 발사하지 않음
        }
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        // 필요한 경우 다른 초기화 작업 수행
    }

    fire() {
        if (this.fireTimer > 0) {
            return;
        }
        this.fireTimer = this.fireDelay;

        const egg = this.eggs.get();
        if (egg) {
            const middleY = this.y + this.height / 2.5;
            // Play the egg sound effect
            if (this.soundManager) {
                this.soundManager.playSound("eggSound");
            }
            egg.fire(this.x, middleY, this.bulletSpeed);
            egg.setScale(this.eggSize);
            egg.damage = this.bulletDamage;
            egg.body.onWorldBounds = true;
            egg.body.world.on("worldbounds", (body) => {
                if (body.gameObject === egg) {
                    egg.destroy();
                }
            });
        }
    }

    collectItem(item) {
        if (this.heldItem) {
            this.heldItem.removeEffect(this);
        }
        this.heldItem = item;
        item.applyEffect(this);
        this.updateHUD();
    }

    resetItemEffects() {
        this.bulletDamage = this.baseBulletDamage;
        this.bulletSpeed = this.baseBulletSpeed;
        this.canStun = false;
    }

    enableStun() {
        this.canStun = true;
    }

    stunMonster(monster) {
        if (this.canStun) {
            monster.setTint(0x0000ff);
            monster.setVelocity(0, 0);
            this.scene.time.delayedCall(this.stunDuration, () => {
                monster.clearTint();
            });
        }
    }

    increaseBulletDamage(amount) {
        this.bulletDamage += amount;
    }

    increaseBulletSpeed(amount) {
        this.bulletSpeed += amount;
    }

    increaseSpeed(amount) {
        this.speed += amount;
    }

    increaseEggSize() {
        this.eggSize = 1.5;
    }

    decreaseBulletDamage(amount) {
        this.bulletDamage = Math.max(
            this.baseBulletDamage,
            this.bulletDamage - amount
        );
    }

    decreaseBulletSpeed(amount) {
        this.bulletSpeed = Math.max(
            this.baseBulletSpeed,
            this.bulletSpeed - amount
        );
    }

    decreaseSpeed(amount) {
        this.speed = Math.max(this.baseSpeed, this.speed - amount);
    }

    decreaseEggSize() {
        this.eggSize = this.baseEggSize;
    }

    updateHUD() {
        const hudScene = this.scene.scene.get("HudScene");
        const effects = this.getUpdatedEffects();

        if (hudScene && hudScene.scene.isActive()) {
            if (effects.length === 0) {
                hudScene.updateBulletInfo(`강화된 효과 없음`);
            } else {
                hudScene.updateBulletInfo(
                    `강화된 효과 : ${effects.join(", ")}`
                );
            }
        }
    }

    move(directions, delta) {
        if (!this.getData("canMove")) return;
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

    setLives(lives) {
        this.lives = lives;
    }

    setEffects({ speed, bulletDamage, bulletSpeed, eggSize }) {
        this.speed = speed;
        this.bulletDamage = bulletDamage;
        this.bulletSpeed = bulletSpeed;
        this.eggSize = eggSize;
    }

    getEffects() {
        return {
            speed: this.speed,
            bulletDamage: this.bulletDamage,
            bulletSpeed: this.bulletSpeed,
            eggSize: this.eggSize,
        };
    }

    getUpdatedEffects() {
        const effects = [];
        if (this.speed !== this.baseSpeed) {
            effects.push("스피드");
        }
        if (this.bulletDamage !== this.baseBulletDamage) {
            effects.push("달걀 데미지");
        }
        if (this.bulletSpeed !== this.baseBulletSpeed) {
            effects.push("달걀 속도");
        }
        if (this.eggSize !== this.baseEggSize) {
            effects.push("달걀 크기");
        }
        return effects;
    }
}

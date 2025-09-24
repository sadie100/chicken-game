import { Physics } from "phaser";
import { Egg } from "./Egg";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    eggs = null;
    isMoving = false;
    heldItem = null;
    activeItems = [];
    activeEffects = { bullet: 0, eggSpeed: 0, speed: 0, eggSize: 0, stun: 0 };
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
    baseFireDelay = 200;
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
                this.soundManager.playSound("eggSound", { volume: 0.5 });
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
        // 다중 아이템 적용: 기존 아이템 유지, 신규 아이템 효과 누적
        this.heldItem = item; // 하위 호환 유지(마지막 획득 아이템)
        this.activeItems.push(item);
        item.applyEffect(this);
        this.updateHUD();
    }

    // 효과 시스템 (누적형)
    addEffect(key, amount = 1, maxStacks = Infinity) {
        if (this.activeEffects[key] === undefined) {
            this.activeEffects[key] = 0;
        }
        this.activeEffects[key] = Math.min(
            maxStacks,
            this.activeEffects[key] + amount
        );
        if (key === "stun") {
            // 스턴은 0/1만 허용
            this.activeEffects[key] = Math.min(1, this.activeEffects[key]);
        }
        this.recomputeStatsFromEffects();
    }

    removeEffect(key, amount = 1) {
        if (this.activeEffects[key] === undefined) {
            return;
        }
        this.activeEffects[key] = Math.max(0, this.activeEffects[key] - amount);
        this.recomputeStatsFromEffects();
    }

    recomputeStatsFromEffects() {
        const { bullet, eggSpeed, speed, eggSize, stun } = this.activeEffects;
        this.bulletDamage = this.baseBulletDamage + bullet * 1;
        this.bulletSpeed = this.baseBulletSpeed + eggSpeed * 100;
        this.fireDelay = this.baseFireDelay - eggSpeed * 10;
        this.speed = this.baseSpeed + speed * 50;
        this.eggSize = this.baseEggSize + eggSize * 0.3;
        this.canStun = stun > 0;
        this.updateHUD();
    }

    resetItemEffects() {
        this.activeEffects = {
            bullet: 0,
            eggSpeed: 0,
            speed: 0,
            eggSize: 0,
            stun: 0,
        };
        this.recomputeStatsFromEffects();
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

    updateHUD() {
        const hudScene = this.scene.scene.get("HudScene");
        if (hudScene && hudScene.scene.isActive()) {
            hudScene.updateEffects(this.activeEffects);
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

        // Play the hit sound effect
        if (this.soundManager) {
            this.soundManager.playSound("hitSound", { volume: 1 });
        }

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

    setEffects(effects) {
        // effects는 activeEffects 형태라고 가정
        this.activeEffects = {
            bullet: 0,
            eggSpeed: 0,
            speed: 0,
            eggSize: 0,
            stun: 0,
            ...effects,
        };
        this.recomputeStatsFromEffects();
    }

    getEffects() {
        return { ...this.activeEffects };
    }
}

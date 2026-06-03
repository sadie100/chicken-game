import { Physics } from "phaser";
import { Egg } from "./Egg";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    eggs = null;
    isMoving = false;
    heldItem = null;
    activeItems = [];
    activeEffects = {
        bullet: 0,
        eggSpeed: 0,
        speed: 0,
        eggSize: 0,
        stun: 0,
        powerEgg: 0,
    };
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
    timedEffectTimers = {};

    constructor({ scene }) {
        super(scene, 100, scene.scale.height / 2, "chicken_idle");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(1);

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
        // PowerEgg 점멸 트윈 핸들러
        this.powerEggBlinkTween = null;
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

        const middleY = this.y + this.height / 2.5;
        const isTriple = (this.activeEffects?.powerEgg ?? 0) > 0;
        if (this.soundManager) {
            this.soundManager.playSound("eggSound", { volume: 0.5 });
        }
        if (isTriple) {
            const angles = [-15, 0, 15];
            for (const angle of angles) {
                const egg = this.eggs.get();
                if (!egg) continue;
                egg.fireWithAngle(this.x, middleY, this.bulletSpeed, angle);
                egg.setScale(this.eggSize);
                egg.damage = this.bulletDamage;
                egg.body.onWorldBounds = true;
                egg.body.world.on("worldbounds", (body) => {
                    if (body.gameObject === egg) {
                        egg.destroy();
                    }
                });
            }
        } else {
            const egg = this.eggs.get();
            if (egg) {
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
    }

    addTimedEffect(key, durationMs, maxStacks = Infinity) {
        if (!this.timedEffectTimers) this.timedEffectTimers = {};
        const existing = this.timedEffectTimers[key];
        if (existing && existing.remove) {
            existing.remove();
        }
        this.addEffect(key, 1, maxStacks);
        if (key === "powerEgg") {
            this.startPowerBlink();
        }
        const timer = this.scene.time.delayedCall(
            durationMs,
            () => {
                this.removeEffect(key, 1);
                if (key === "powerEgg") {
                    this.stopPowerBlink();
                }
                if (this.timedEffectTimers) {
                    delete this.timedEffectTimers[key];
                }
            },
            null,
            this
        );
        this.timedEffectTimers[key] = timer;
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
        this.fireDelay = this.baseFireDelay - eggSpeed * 20;
        this.speed = this.baseSpeed + speed * 50;
        this.eggSize = this.baseEggSize + eggSize * 0.3;
        this.canStun = stun > 0;
        this.updateHUD();
    }

    resetItemEffects() {
        // 타임드 이펙트 타이머 모두 해제
        if (this.timedEffectTimers) {
            Object.values(this.timedEffectTimers).forEach(
                (t) => t && t.remove && t.remove()
            );
            this.timedEffectTimers = {};
        }
        this.stopPowerBlink();
        this.activeEffects = {
            bullet: 0,
            eggSpeed: 0,
            speed: 0,
            eggSize: 0,
            stun: 0,
            powerEgg: 0,
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
            powerEgg: 0,
            ...effects,
        };
        this.recomputeStatsFromEffects();
        // powerEgg 효과가 이미 적용되어 있다면 시각적 효과를 복원
        if ((this.activeEffects?.powerEgg ?? 0) > 0) {
            this.startPowerBlink();
        }
    }

    getEffects() {
        return { ...this.activeEffects };
    }

    startPowerBlink() {
        if (this.powerEggBlinkTween) return;
        this.powerEggBlinkTween = this.scene.tweens.add({
            targets: this,
            tint: 0xff4444,
            duration: 80,
            yoyo: true,
            repeat: -1,
        });
    }

    stopPowerBlink() {
        if (this.powerEggBlinkTween) {
            this.scene.tweens.killTweensOf(this);
            this.powerEggBlinkTween = null;
            this.clearTint();
        }
    }

    // 다음 씬으로 넘어왔을 때, 남은 시간만큼 타임드 이펙트 만료를 재스케줄
    scheduleTimedEffectRemoval(key, remainingMs) {
        if (!this.timedEffectTimers) this.timedEffectTimers = {};
        const existing = this.timedEffectTimers[key];
        if (existing && existing.remove) {
            existing.remove();
        }

        const delay = Math.max(0, (remainingMs ?? 0) | 0);
        const timer = this.scene.time.delayedCall(
            delay,
            () => {
                this.removeEffect(key, 1);
                if (key === "powerEgg") {
                    this.stopPowerBlink();
                }
                if (this.timedEffectTimers) {
                    delete this.timedEffectTimers[key];
                }
            },
            null,
            this
        );
        this.timedEffectTimers[key] = timer;
    }

    // 현재 적용 중인 타임드 이펙트들의 남은 시간을 반환
    getTimedEffectsRemaining() {
        const result = {};
        if (!this.timedEffectTimers) return result;
        for (const [key, timer] of Object.entries(this.timedEffectTimers)) {
            if (!timer) continue;
            const elapsed =
                typeof timer.getElapsed === "function" ? timer.getElapsed() : 0;
            const delay = timer.delay ?? 0;
            const remaining = Math.max(0, delay - elapsed);
            if (remaining > 0) {
                result[key] = remaining;
            }
        }
        return result;
    }
}


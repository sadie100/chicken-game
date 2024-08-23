import { Monster } from "./Monster";
import { Bullet } from "../Bullet";
import { Pig } from "./Pig";
import { Cat } from "./Cat";

export class GoldPig extends Monster {
    constructor(scene, x, y) {
        super(scene, x, y, "gold_pig");
        this.health = 100;
        this.maxHealth = 100;
        this.setScale(5);
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            maxSize: 30,
        });
        this.patterns = [
            this.pattern1.bind(this),
            this.pattern2.bind(this),
            this.pattern3.bind(this),
            this.pattern4.bind(this),
        ];
        this.currentPatternIndex = 0;
        this.isUltimateUsed = false;
        this.isPatternActive = false;
        this.scene = scene;
        this.initialX = x;
        this.initialY = y;

        if (this.scene.anims.exists("gold_pig_walk")) {
            this.play("gold_pig_walk");
        }

        this.startNextPattern();
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.health <= 50 && !this.isUltimateUsed) {
            this.ultimatePattern();
        }

        if (!this.isPatternActive) {
            this.startNextPattern();
        }
    }

    startNextPattern() {
        if (!this.isPatternActive) {
            this.isPatternActive = true;
            this.patterns[this.currentPatternIndex]();
            this.currentPatternIndex =
                (this.currentPatternIndex + 1) % this.patterns.length;
        }
    }

    hit(damage) {
        super.hit(damage);

        // 체력이 변경될 때마다 이벤트 발생
        this.scene.events.emit(
            "bossHealthChanged",
            this.health / this.maxHealth
        );

        if (this.health <= 0) {
            // 보스가 죽었을 때의 처리
            this.scene.goToNextStage();
        }
    }

    // 체력을 설정하는 메서드 추가

    setHealth(health) {
        this.maxHealth = health;
        this.health = health;
        this.scene.events.emit("bossHealthChanged", 1);
    }

    pattern1() {
        this.isPatternActive = true;
        const twitchCount = Phaser.Math.Between(2, 3);
        let delay = 0;

        // 뒤로 움찔거리기 (2-3번)
        for (let i = 0; i < twitchCount; i++) {
            this.scene.tweens.add({
                targets: this,
                x: this.x + 20,
                duration: 100,
                ease: "Power1",
                yoyo: true,
                delay: delay,
            });
            delay += 200; // 각 움찔거림 사이의 지연 시간
        }

        // 전방(왼쪽)으로 빠르게 전진
        this.scene.tweens.add({
            targets: this,
            x: 50,
            duration: 500,
            ease: "Power2",
            delay: delay,
        });

        delay += 500;

        // 제자리로 돌아가기
        this.scene.tweens.add({
            targets: this,
            x: this.initialX,
            duration: 1000,
            ease: "Power2",
            delay: delay,
            onComplete: () => {
                this.isPatternActive = false;
            },
        });
    }
    pattern2() {
        this.isPatternActive = true;
        let delay = 0;

        const fireTripleBullet = () => {
            for (let i = -1; i <= 1; i++) {
                const bullet = this.bullets.get(this.x, this.y, "enemy-bullet");
                if (bullet) {
                    bullet.setScale(2);
                    bullet.fire(this.x, this.y, -400, i * 50);
                }
            }
        };

        // 위로 이동
        this.scene.tweens.add({
            targets: this,
            y: this.initialY - 100,
            duration: 1000,
            ease: "Sine.easeInOut",
            onUpdate: () => {
                if (Math.random() < 0.1) fireTripleBullet();
            },
            delay: delay,
        });
        delay += 1000;

        // 아래로 이동
        this.scene.tweens.add({
            targets: this,
            y: this.initialY + 100,
            duration: 2000,
            ease: "Sine.easeInOut",
            onUpdate: () => {
                if (Math.random() < 0.1) fireTripleBullet();
            },
            delay: delay,
        });
        delay += 2000;

        // 원래 위치로
        this.scene.tweens.add({
            targets: this,
            y: this.initialY,
            duration: 1000,
            ease: "Sine.easeInOut",
            onUpdate: () => {
                if (Math.random() < 0.1) fireTripleBullet();
            },
            delay: delay,
            onComplete: () => {
                this.isPatternActive = false;
            },
        });
    }

    pattern3() {
        this.isPatternActive = true;
        let delay = 0;

        const diamondPoints = [
            {
                x: this.scene.scale.width * 0.75,
                y: this.scene.scale.height - 100,
            },
            {
                x: 0,
                y: this.scene.scale.height / 2,
            },
            { x: this.scene.scale.width * 0.75, y: 100 },
            { x: this.scene.scale.width - 100, y: this.scene.scale.height / 2 },
        ];

        // 위 중앙으로 이동
        this.scene.tweens.add({
            targets: this,
            x: this.scene.scale.width * 0.75,
            y: 100,
            duration: 1000,
            ease: "Power2",
            delay: delay,
        });
        delay += 1000;

        // 다이아몬드 모양 이동
        diamondPoints.forEach((point) => {
            this.scene.tweens.add({
                targets: this,
                x: point.x,
                y: point.y,
                duration: 500,
                ease: "Linear",
                delay: delay,
            });
            delay += 500;
        });

        // 원래 위치로 돌아가기
        this.scene.tweens.add({
            targets: this,
            x: this.initialX,
            y: this.initialY,
            duration: 1000,
            ease: "Power2",
            delay: delay,
            onComplete: () => {
                this.isPatternActive = false;
            },
        });

        // 회전 애니메이션
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
            delay: 1000,
            onComplete: () => {
                this.setRotation(0);
            },
        });
    }

    pattern4() {
        this.isPatternActive = true;
        let spawnCount = 0;
        const maxSpawns = 10;

        const spawnMonster = () => {
            if (spawnCount >= maxSpawns) {
                this.scene.time.delayedCall(1000, () => {
                    this.isPatternActive = false;
                });
                return;
            }

            const spawnArea = Math.random();
            let x, y, direction;

            if (spawnArea < 0.4) {
                x = this.scene.scale.width;
                y = Phaser.Math.Between(0, this.scene.scale.height);
                direction = "straight";
            } else if (spawnArea < 0.7) {
                x = Phaser.Math.Between(
                    this.scene.scale.width * 0.7,
                    this.scene.scale.width
                );
                y = 0;
                direction = "down";
            } else {
                x = Phaser.Math.Between(
                    this.scene.scale.width * 0.7,
                    this.scene.scale.width
                );
                y = this.scene.scale.height;
                direction = "up";
            }

            const monsterType = Math.random() < 0.5 ? Pig : Cat;
            const monster = new monsterType(this.scene, x, y, 300, direction);
            this.scene.monsters.add(monster);

            spawnCount++;
            this.scene.time.delayedCall(500, spawnMonster);
        };

        spawnMonster();
    }

    ultimatePattern() {
        this.isUltimateUsed = true;
        this.isPatternActive = true;

        const centerX = this.x;
        const centerY = this.y;
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
            { x: 0.707, y: 0.707 },
            { x: -0.707, y: 0.707 },
            { x: 0.707, y: -0.707 },
            { x: -0.707, y: -0.707 },
        ];

        let angle = 0;
        const bulletCount = 32;
        const bulletSpeed = 300;

        const fireBullets = () => {
            for (let i = 0; i < 8; i++) {
                const bullet = this.bullets.get(
                    centerX,
                    centerY,
                    "enemy-bullet"
                );
                if (bullet) {
                    bullet.setScale(2);
                    const direction = directions[i];
                    bullet.fire(
                        centerX,
                        centerY,
                        direction.x * bulletSpeed,
                        direction.y * bulletSpeed
                    );
                    bullet.setRotation(angle);
                }
            }
            angle += Math.PI / 16;
        };

        this.scene.tweens.add({
            targets: this,
            scaleX: 5.5,
            scaleY: 5.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        for (let i = 0; i < bulletCount; i++) {
            this.scene.time.delayedCall(i * 100, fireBullets);
        }

        this.scene.time.delayedCall(bulletCount * 100 + 1000, () => {
            this.scene.tweens.killTweensOf(this);
            this.setScale(5);
            this.isPatternActive = false;
            this.startNextPattern();
        });
    }
}


import { Monster } from "./Monster";
import { Bullet } from "./Bullet";

export class GoldPig extends Monster {
    constructor(scene, x, y) {
        super(scene, x, y, "gold_pig");
        this.health = 100;
        this.setScale(5);
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
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
    }

    startNextPattern() {
        if (!this.isPatternActive) {
            this.isPatternActive = true;
            this.patterns[this.currentPatternIndex]();
            this.currentPatternIndex =
                (this.currentPatternIndex + 1) % this.patterns.length;
        }
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

        const scaleAnimation = this.scene.tweens.add({
            targets: this,
            scaleX: 5.5,
            scaleY: 5.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        const bulletTimer = this.scene.time.addEvent({
            delay: 100,
            callback: fireBullets,
            callbackScope: this,
            repeat: bulletCount - 1,
        });

        this.scene.time.delayedCall(bulletCount * 100 + 1000, () => {
            scaleAnimation.stop();
            this.setScale(5);
            this.isPatternActive = false;
            this.startNextPattern();
        });
    }

    // 여기에 다른 패턴들을 구현할 수 있습니다.
    pattern1() {
        // 패턴 1 구현
    }

    pattern2() {
        // 패턴 2 구현
    }

    pattern3() {
        // 패턴 3 구현
    }

    pattern4() {
        // 패턴 4 구현
    }
}

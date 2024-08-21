import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Pig } from "../gameobjects/monsters/Pig";
import { Cat } from "../gameobjects/monsters/Cat";
import { Monster } from "../gameobjects/monsters/Monster";

export class MainScene extends Scene {
    player = null;
    monsters = null;
    cursors = null;
    points = 0;
    hudScene = null;
    spawnTimer = null;
    initialSpawnDelay = 2000;
    minSpawnDelay = 500;
    spawnReductionRate = 100;
    gameTime = 0;
    initialMonsterSpeed = 100;
    currentMonsterSpeed = 100;
    monsterSpeedIncreaseRate = 5;
    catUnlockTime = 30;
    difficultyIncreaseInterval = 5;
    initialCatProbability = 0.3;
    maxCatProbability = 0.7;
    catProbabilityIncreaseRate = 0.01;
    monstersPerSpawn = 1;
    advancedSpawnTime = 60; // 1분 후 고급 스폰 시작

    constructor() {
        super("MainScene");
    }

    create() {
        this.add.image(0, 0, "farm_background").setOrigin(0, 0);

        // Player
        this.player = new Player({ scene: this });

        // Monsters group
        this.monsters = this.physics.add.group({
            classType: Monster,
            runChildUpdate: true,
        });

        // Spawn monsters
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnMonster,
            callbackScope: this,
            loop: true,
        });

        // Cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // WASD keys for alternative movement
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.input.keyboard.on("keydown-SPACE", () => {
            this.player.fire();
        });

        // Collision detection
        this.physics.add.overlap(
            this.player.eggs,
            this.monsters,
            this.hitMonster,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.monsters,
            this.playerHitMonster,
            null,
            this
        );

        // HUD 씬 시작
        this.scene.launch("HudScene");
        this.hudScene = this.scene.get("HudScene");

        // 적 스폰 타이머 설정
        this.spawnTimer = this.time.addEvent({
            delay: this.initialSpawnDelay,
            callback: this.spawnMonsters,
            callbackScope: this,
            loop: true,
        });

        // 게임 시간 및 난이도 조절을 위한 타이머
        this.time.addEvent({
            delay: 1000, // 1초마다
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true,
        });
    }

    updateGameTime() {
        this.gameTime++;

        if (this.gameTime % this.difficultyIncreaseInterval === 0) {
            let newDelay = this.spawnTimer.delay - this.spawnReductionRate;
            if (newDelay <= this.minSpawnDelay) {
                newDelay = this.minSpawnDelay;
                if (this.monstersPerSpawn < 10) {
                    this.monstersPerSpawn++;
                }
            }
            this.spawnTimer.delay = newDelay;
            this.currentMonsterSpeed += this.monsterSpeedIncreaseRate;

            console.log(
                `Spawn delay: ${newDelay}ms, Monster speed: ${this.currentMonsterSpeed}, Monsters per spawn: ${this.monstersPerSpawn}`
            );
        }
    }

    getCatProbability() {
        if (this.gameTime < this.catUnlockTime) {
            return 0;
        }
        const timeSinceCatUnlock = this.gameTime - this.catUnlockTime;
        const increasedProbability =
            this.initialCatProbability +
            (timeSinceCatUnlock / 10) * this.catProbabilityIncreaseRate;
        return Math.min(increasedProbability, this.maxCatProbability);
    }

    spawnMonsters() {
        for (let i = 0; i < this.monstersPerSpawn; i++) {
            this.spawnSingleMonster();
        }
    }

    spawnSingleMonster() {
        let x, y, direction;

        if (this.gameTime >= this.advancedSpawnTime) {
            const spawnArea = Math.random();
            if (spawnArea < 0.6) {
                // 오른쪽 벽 (60% 확률)
                x = this.scale.width;
                y = Phaser.Math.Between(0, this.scale.height);
                direction = "straight"; // 왼쪽으로 직선 이동
            } else if (spawnArea < 0.8) {
                // 오른쪽 상단 (20% 확률)
                x = Phaser.Math.Between(
                    this.scale.width * 0.7,
                    this.scale.width
                );
                y = 0;
                direction = "down";
            } else {
                // 오른쪽 하단 (20% 확률)
                x = Phaser.Math.Between(
                    this.scale.width * 0.7,
                    this.scale.width
                );
                y = this.scale.height;
                direction = "up";
            }
        } else {
            // 기본 스폰 시스템
            x = this.scale.width;
            y = Phaser.Math.Between(0, this.scale.height);
            direction = "straight"; // 왼쪽으로 직선 이동
        }

        const catProbability = this.getCatProbability();
        let monster;
        if (Math.random() < catProbability) {
            monster = new Cat(this, x, y, this.currentMonsterSpeed, direction);
        } else {
            monster = new Pig(this, x, y, this.currentMonsterSpeed, direction);
        }

        this.monsters.add(monster);
    }

    hitMonster(egg, monster) {
        console.log("Egg hit monster. Damage:", egg.damage);
        monster.hit(egg.damage);

        this.points += 10;
        this.hudScene.update_points(this.points);

        // Update score display

        egg.destroy(); // egg를 완전히 제거합니다.
    }

    gameOver() {
        console.log("Game Over called"); // 디버깅용 로그 추가
        this.scene.start("GameOverScene", { points: this.points });
    }

    playerHitMonster(player, monster) {
        monster.destroy();
        const remainingLives = player.loseLife();
        this.hudScene.updateLives(remainingLives);

        if (remainingLives <= 0) {
            this.gameOver();
        }
    }

    update(time, delta) {
        const directions = [];

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            directions.push("up");
        }
        if (this.cursors.down.isDown || this.wasd.down.isDown) {
            directions.push("down");
        }
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            directions.push("left");
        }
        if (this.cursors.right.isDown || this.wasd.right.isDown) {
            directions.push("right");
        }

        if (directions.length > 0) {
            this.player.move(directions, delta);
        } else {
            this.player.playIdleAnimation();
        }

        if (
            !this.cursors.up.isDown &&
            !this.cursors.down.isDown &&
            !this.cursors.left.isDown &&
            !this.cursors.right.isDown &&
            !this.wasd.up.isDown &&
            !this.wasd.down.isDown &&
            !this.wasd.left.isDown &&
            !this.wasd.right.isDown
        ) {
            this.player.playIdleAnimation();
        }
    }
}


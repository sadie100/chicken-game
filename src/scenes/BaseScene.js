import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Monster } from "../gameobjects/monsters/Monster";
import { Heart } from "../gameobjects/Heart";

export class BaseScene extends Scene {
    player = null;
    monsters = null;
    cursors = null;
    points = 0;
    hudScene = null;
    spawnTimer = null;
    gameTime = 0;
    stageTime = 90000; // 1분 30초
    isStageComplete = false;
    nextStageArrow = null;

    // 몬스터 스폰 관련 변수
    initialSpawnDelay = 2000;
    minSpawnDelay = 500;
    spawnReductionRate = 100;
    currentSpawnDelay = 2000;

    // 몬스터 속도 관련 변수
    initialMonsterSpeed = 100;
    currentMonsterSpeed = 100;
    monsterSpeedIncreaseRate = 5;

    // 고급 스폰 시스템
    advancedSpawnTime = 30000; // 30초 후 고급 스폰 시작
    monstersPerSpawn = 1;

    constructor(key) {
        super(key);
    }

    create() {
        this.add.image(0, 0, this.getBackgroundKey()).setOrigin(0, 0);

        // Player
        this.player = new Player({ scene: this });

        // Monsters group
        this.monsters = this.physics.add.group({
            classType: Monster,
            runChildUpdate: true,
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
        this.setupCollisions();

        // HUD 씬 시작
        this.setupHUD();
        this.setupSpawnTimer();

        // 게임 시간 및 난이도 조절을 위한 타이머
        this.time.addEvent({
            delay: 1000, // 1초마다
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true,
        });

        // Hearts group
        this.hearts = this.physics.add.group({
            classType: Heart,
            runChildUpdate: true,
        });

        // Collision detection for hearts
        this.physics.add.overlap(
            this.player,
            this.hearts,
            this.collectHeart,
            null,
            this
        );
    }

    setupCollisions() {
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
    }

    setupHUD() {
        this.scene.launch("HudScene");
        this.hudScene = this.scene.get("HudScene");
    }

    setupSpawnTimer() {
        this.spawnTimer = this.time.addEvent({
            delay: this.currentSpawnDelay,
            callback: this.spawnMonsters,
            callbackScope: this,
            loop: true,
        });
    }

    updateGameTime() {
        this.gameTime += 1000;
        this.updateDifficulty();
        // Heart spawn logic
        if (
            this.isHeartSpawnTimerRunning &&
            this.time.now >= this.lastHeartSpawnTime
        ) {
            this.spawnHeart();
        }
        if (this.gameTime >= this.stageTime && !this.isStageComplete) {
            this.completeStage();
        }
    }

    updateDifficulty() {
        // 스폰 주기 감소
        this.currentSpawnDelay = Math.max(
            this.minSpawnDelay,
            this.currentSpawnDelay - this.spawnReductionRate
        );
        this.spawnTimer.delay = this.currentSpawnDelay;

        // 몬스터 속도 증가
        this.currentMonsterSpeed += this.monsterSpeedIncreaseRate;

        // 고급 스폰 시스템
        if (
            this.gameTime >= this.advancedSpawnTime &&
            this.monstersPerSpawn < 3
        ) {
            this.monstersPerSpawn = Math.min(
                3,
                Math.floor(this.gameTime / this.advancedSpawnTime)
            );
        }

        console.log(
            `Spawn delay: ${this.currentSpawnDelay}ms, Monster speed: ${this.currentMonsterSpeed}, Monsters per spawn: ${this.monstersPerSpawn}`
        );
    }

    spawnMonsters() {
        for (let i = 0; i < this.monstersPerSpawn; i++) {
            this.spawnSingleMonster();
        }
    }

    spawnSingleMonster() {
        // 자식 클래스에서 구현
    }

    hitMonster(egg, monster) {
        console.log("Egg hit monster. Damage:", egg.damage);
        monster.hit(egg.damage);
        this.points += 10;
        this.hudScene.update_points(this.points);
        egg.destroy();
    }
    playerHitMonster(player, monster) {
        monster.destroy();
        const remainingLives = player.loseLife();
        this.hudScene.updateLives(remainingLives);

        if (remainingLives <= 0) {
            this.gameOver();
        } else {
            this.startHeartSpawnTimer();
        }
    }

    startHeartSpawnTimer() {
        if (!this.isHeartSpawnTimerRunning) {
            this.isHeartSpawnTimerRunning = true;
            this.setNextHeartSpawnTime();
        }
    }

    setNextHeartSpawnTime() {
        const randomDelay = Phaser.Math.Between(10000, 20000); // 10초에서 20초 사이의 랜덤한 시간
        this.lastHeartSpawnTime = this.time.now + randomDelay;
    }

    spawnHeart() {
        if (this.player.getLives() < 5) {
            const x = Phaser.Math.Between(50, this.scale.width - 50);
            const y = Phaser.Math.Between(50, this.scale.height - 50);
            const heart = new Heart(this, x, y);
            this.hearts.add(heart);
            heart.spawn(x, y);
            this.setNextHeartSpawnTime();
        } else {
            this.isHeartSpawnTimerRunning = false;
        }
    }

    collectHeart(player, heart) {
        const newLives = Math.min(player.getLives() + 1, 5);
        player.setLives(newLives);
        this.hudScene.updateLives(newLives);

        if (newLives >= 5) {
            this.isHeartSpawnTimerRunning = false;
        }

        heart.despawn();
    }

    gameOver() {
        console.log("Game Over called");
        this.scene.start("GameOverScene", { points: this.points });
    }

    update(time, delta) {
        if (!this.isStageComplete) {
            this.handlePlayerMovement(delta);
        }
    }

    handlePlayerMovement(delta) {
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

    // 자식 클래스에서 오버라이드할 메서드들
    getBackgroundKey() {
        return "background1";
    }

    getInitialSpawnDelay() {
        return this.initialSpawnDelay;
    }
}


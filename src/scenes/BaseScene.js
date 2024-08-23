import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Monster } from "../gameobjects/monsters/Monster";
import { Heart } from "../gameobjects/Heart";
import { ItemManager } from "../gameobjects/Item";

export class BaseScene extends Scene {
    player = null;
    monsters = null;
    cursors = null;
    points = 0;
    hudScene = null;
    spawnTimer = null;
    gameTime = 0;
    stageTime = 1500; // 1분으로 변경 (60000ms = 1분)
    background = null;

    // 몬스터 스폰 관련 변수
    initialSpawnDelay = 1000; // 1초로 변경
    minSpawnDelay = 500;
    spawnReductionRate = 100;
    currentSpawnDelay = 1000; // 초기 스폰 딜레이도 1초로 변경

    // 몬스터 속도 관련 변수
    initialMonsterSpeed = 150; // 150으로 변경
    currentMonsterSpeed = 150; // 현재 속도도 150으로 초기화
    monsterSpeedIncreaseRate = 5;

    // 고급 스폰 시스템
    advancedSpawnTime = 30000; // 30초 후 고급 스폰 시작
    monstersPerSpawn = 1;

    //라운드 종료
    elapsedSeconds = 0;
    isStageComplete = false;
    nextRoundArrow = null;

    constructor(key) {
        super(key);
    }

    create() {
        // 대신, 즉시 불투명해지도록 설정
        this.cameras.main.alpha = 1;

        // 게임의 전반적인 밝기를 일정하게 유지
        this.cameras.main.setBackgroundColor("#1c172e"); // 기본 배경색 설정

        this.createBackground();

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

        // Player의 초기 총알 정보 업데이트
        this.time.delayedCall(100, () => {
            this.player.updateHUD();
        });

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

        // ItemManager 생성 및 아이템 추가
        this.itemManager = new ItemManager(this);
        // 아이템과 플레이어 간의 충돌 설정
        this.physics.add.overlap(
            this.player,
            this.itemManager.items,
            this.collectItem,
            null,
            this
        );

        // 장면 전환을 위한 오버레이 생성
        this.transitionOverlay = this.add.rectangle(
            0,
            0,
            this.scale.width,
            this.scale.height,
            0x000000
        );
        this.transitionOverlay.setOrigin(0);
        this.transitionOverlay.setDepth(1000);
        this.transitionOverlay.alpha = 1; // 시작 시 완전히 불투명하게 설정

        this.events.on("wake", this.onSceneWake, this);
    }

    onSceneWake() {
        // Scene이 다시 활성화될 때 호출되는 메서드
        this.cameras.main.alpha = 1;
        this.cameras.main.setBackgroundColor("#1c172e");
    }

    createItems() {
        // 이 메서드는 자식 클래스에서 오버라이드됩니다.
    }

    collectItem(player, item) {
        if (player.heldItem) {
            player.heldItem.return();
        }
        player.collectItem(item);
        item.collect();
    }

    completeStage() {
        this.isStageComplete = true;

        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }

        this.showNextRoundArrow();
        this.createItems();
    }

    showNextRoundArrow() {
        this.nextRoundArrow = this.add
            .image(this.scale.width - 50, this.scale.height / 2, "next-arrow")
            .setInteractive();
        this.nextRoundArrow.setScale(2);

        this.nextRoundArrow.on("pointerdown", () => {
            this.player.setData("canMove", true);
            this.nextRoundArrow.destroy();
        });
    }

    update(time, delta) {
        if (this.background) {
            this.background.update(delta);
        }
        if (!this.isStageComplete) {
            this.handlePlayerMovement(delta);
        } else {
            this.handlePlayerMovement(delta);
            // 플레이어가 화면 오른쪽 끝에 도달했는지 확인
            if (this.player.x > this.scale.width - this.player.width / 2) {
                this.startNextRound();
            }
        }
    }

    startNextRound(nextSceneKey) {
        // 아이템 설명 숨기기
        if (this.itemManager) {
            this.itemManager.hideAllDescriptions();
        }

        // 다음 Scene으로 전환 시 fade out 효과 대신 즉시 전환
        this.scene.start(nextSceneKey, {
            x: this.scale.width,
            player: this.player,
            points: this.points,
            lives: this.player.getLives(),
            heldItem: this.player.heldItem,
        });
        this.previousSceneKey = this.scene.key;
    }

    resetVariables() {
        this.gameTime = 0;
        this.elapsedSeconds = 0;
        this.currentSpawnDelay = this.initialSpawnDelay;
        this.currentMonsterSpeed = this.initialMonsterSpeed;
        this.monstersPerSpawn = 1;
        // HUD 시간 리셋
        if (this.hudScene) {
            this.hudScene.updateTime(0);
        }
    }

    createBackground() {
        // 기본 배경 키 설정 (자식 클래스에서 오버라이드 가능)
        this.background = this.getBackground();
        this.background.create();
    }

    getBackground() {
        // (자식 클래스에서 오버라이드해야 함)
        throw new Error("getBackground must be implemented in child class");
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
        if (this.isStageComplete) return;

        this.gameTime += 1000;
        this.elapsedSeconds = Math.floor(this.gameTime / 1000);
        this.updateDifficulty();

        // HudScene의 시간 업데이트
        if (this.hudScene) {
            this.hudScene.updateTime(this.elapsedSeconds);
        }

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

    getInitialSpawnDelay() {
        return this.initialSpawnDelay;
    }
}


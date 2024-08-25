import { BaseScene } from "./BaseScene";

export class NormalScene extends BaseScene {
    spawnTimer = null;
    gameTime = 0;
    stageTime = 60000; // 1분으로 변경 (60000ms = 1분)

    // 몬스터 스폰 관련 변수

    initialSpawnDelay = 1000; // 1초로 변경
    minSpawnDelay = 500;
    spawnReductionRate = 200;
    currentSpawnDelay = 1000; // 초기 스폰 딜레이도 1초로 변경

    // 몬스터 속도 관련 변수
    initialMonsterSpeed = 150; // 150으로 변경
    currentMonsterSpeed = 150; // 현재 속도도 150으로 초기화
    monsterSpeedIncreaseRate = 5;

    middleSpawnTime = 20000; // 20초 후 중급 스폰 시작
    updownSpawnTime = 30000; // 30초 후 맵 위 아래 스폰 시작
    // 고급 스폰 시스템
    advancedSpawnTime = 40000; // 40초 후 고급 스폰 시작
    monstersPerSpawn = 1;

    //라운드 종료
    elapsedSeconds = 0;
    isStageComplete = false;
    nextRoundArrow = null;

    constructor(key) {
        super(key);
    }

    init(data) {
        super.init(data);
    }

    create() {
        super.create();

        this.setupSpawnTimer();
        this.isStageComplete = false;
        // 게임 시간 및 난이도 조절을 위한 타이머
        this.time.addEvent({
            delay: 1000, // 1초마다
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true,
        });
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
    }

    update(time, delta) {
        super.update(time, delta);
        if (this.isStageComplete) {
            // 플레이어가 화면 오른쪽 끝에 도달했는지 확인
            if (this.player.x > this.scale.width - this.player.width / 2) {
                this.startNextRound();
            }
        }
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

        // 중급 스폰 시스템
        if (
            this.gameTime >= this.middleSpawnTime &&
            this.monstersPerSpawn < 3
        ) {
            this.monstersPerSpawn = Math.min(
                3,
                this.monstersPerSpawn +
                    Math.floor((this.gameTime - this.middleSpawnTime) / 10)
            );
        }
        // 고급 스폰 시스템
        if (
            this.gameTime >= this.advancedSpawnTime &&
            this.monstersPerSpawn < 5
        ) {
            this.monstersPerSpawn = Math.min(
                5,
                this.monstersPerSpawn +
                    Math.floor((this.gameTime - this.advancedSpawnTime) / 10)
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

    getSpawnPosition() {
        let x, y, direction;

        if (this.gameTime >= this.advancedSpawnTime) {
            return this.getSpecialSpawnPosition(this.scale.width * 0.3);
        } else if (this.gameTime >= this.updownSpawnTime) {
            return this.getSpecialSpawnPosition(this.scale.width * 0.7);
        } else {
            x = this.scale.width;
            y = Phaser.Math.Between(0, this.scale.height);
            direction = "straight";
        }

        return { x, y, direction };
    }

    getSpecialSpawnPosition(widthBound) {
        let x, y, direction;
        const spawnArea = Math.random();
        if (spawnArea < 0.6) {
            x = this.scale.width;
            y = Phaser.Math.Between(0, this.scale.height);
            direction = "straight";
        } else if (spawnArea < 0.8) {
            x = Phaser.Math.Between(widthBound, this.scale.width);
            y = 0;
            direction = "down";
        } else {
            x = Phaser.Math.Between(widthBound, this.scale.width);
            y = this.scale.height;
            direction = "up";
        }
        return { x, y, direction };
    }
    hitMonster(egg, monster) {
        console.log("Egg hit monster. Damage:", egg.damage);
        monster.hit(egg.damage);
        this.points += 10;
        this.hudScene.update_points(this.points);
        egg.destroy();
    }

    playerHitMonster(player, monster) {
        super.playerHitMonster(player, monster);
        monster.destroy();
    }

    getInitialSpawnDelay() {
        return this.initialSpawnDelay;
    }
}


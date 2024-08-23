import { ItemManager } from "../gameobjects/Item";
import { BaseScene } from "./BaseScene";

export class NormalScene extends BaseScene {
    spawnTimer = null;
    gameTime = 0;
    stageTime = 60000; // 1분으로 변경 (60000ms = 1분)

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

    init(data) {
        if (data.restart) {
            this.resetScene();
        }
    }
    resetScene() {
        // Reset necessary variables and game state
        this.resetVariables();
        this.points = 0;
        // Add any other reset logic specific to this scene
    }

    create() {
        super.create();

        this.setupSpawnTimer();

        // 게임 시간 및 난이도 조절을 위한 타이머
        this.time.addEvent({
            delay: 1000, // 1초마다
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true,
        });

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
        super.update(time, delta);
        if (isStageComplete) {
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

        this.scene.stop(this.scene.key);
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
        super.playerHitMonster(player, monster);
        monster.destroy();
    }

    getInitialSpawnDelay() {
        return this.initialSpawnDelay;
    }
}


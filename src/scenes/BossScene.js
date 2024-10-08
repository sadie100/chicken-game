import { BaseScene } from "./BaseScene";
import { GoldPig } from "../gameobjects/monsters/GoldPig";
import { Background } from "../backgrounds/Background";
import { BossHealthBar } from "../gameobjects/BossHealthBar";

export class BossScene extends BaseScene {
    constructor() {
        super("BossScene");
    }

    init(data) {
        super.init(data);
    }

    resetScene() {
        // Reset necessary variables and game state
        this.points = 0;
        // Add any other reset logic specific to this scene
    }

    resetVariables() {
        this.gameTime = 0;
        this.elapsedSeconds = 0;
        if (this.hudScene) {
            this.hudScene.updateTime(0);
        }
    }

    create() {
        super.create();

        this.soundManager.changeBGM("bgm3");

        this.spawnBossMonster();

        // 게임 시간 및 난이도 조절을 위한 타이머
        this.time.addEvent({
            delay: 1000, // 1초마다
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true,
        });
    }

    updateGameTime() {
        this.gameTime += 1000;
        this.elapsedSeconds = Math.floor(this.gameTime / 1000);

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
    }

    setupCollisionsWithBullets(bullets) {
        this.physics.add.overlap(
            this.player,
            bullets,
            this.playerHitBullet,
            null,
            this
        );
    }
    getBackground() {
        return new Background(this, "background3", 4);
    }

    createItems() {}

    spawnBossMonster() {
        this.boss = new GoldPig(this, 600, 300);
        this.boss.setHealth(100);

        this.bossHealthBar = new BossHealthBar(this);

        this.events.on("bossHealthChanged", this.updateBossHealthBar, this);

        this.updateBossHealthBar(1);
        this.monsters.add(this.boss);
    }

    goToNextStage() {
        console.log("Game Completed!");
        this.events.off("bossHealthChanged", this.updateBossHealthBar, this);
        this.scene.stop("BossScene");
        this.scene.start("GameClearScene", { points: this.points });
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.boss && this.boss.active) {
            this.boss.update(time, delta);

            const healthPercentage = this.boss.health / this.boss.maxHealth;
            this.updateBossHealthBar(healthPercentage);
        }
    }

    updateBossHealthBar(healthPercentage) {
        if (this.bossHealthBar) {
            this.bossHealthBar.setValue(healthPercentage);
        }
    }

    playerHitBullet(player, bullet) {
        const remainingLives = player.loseLife();
        this.hudScene.updateLives(remainingLives);

        bullet.destroy();
        if (remainingLives <= 0) {
            this.gameOver();
        } else {
            this.startHeartSpawnTimer();
        }
    }
}

import { BaseScene } from "./BaseScene";
import { GoldPig } from "../gameobjects/monsters/GoldPig";
import { Background } from "../backgrounds/Background";
import { BossHealthBar } from "../gameobjects/BossHealthBar";

export class BossScene extends BaseScene {
    constructor() {
        super("BossScene");
    }

    init(data) {
        this.player = data.player;
        this.points = data.points || 0;
        this.resetVariables();
        if (data.lives) {
            this.player.setLives(data.lives);
        }
        if (data.heldItem) {
            this.player.heldItem = data.heldItem;
        }
    }

    resetVariables() {
        this.gameTime = 0;
        this.elapsedSeconds = 0;
        // HUD 시간 리셋
        if (this.hudScene) {
            this.hudScene.updateTime(0);
        }
    }

    create() {
        super.create();

        if (this.hudScene) {
            this.hudScene.updateLives(this.player.getLives());
            this.player.updateHUD(); // 아이템 효과가 적용된 상태로 HUD 업데이트
        }
        // 배경 생성 후 전환 오버레이 페이드 아웃
        this.tweens.add({
            targets: this.transitionOverlay,
            alpha: 0,
            duration: 500,
            ease: "Power2",
        });

        this.spawnBossMonster();
    }

    getBackground() {
        return new Background(this, "background3", 4);
    }

    createItems() {}

    spawnBossMonster() {
        // 보스 생성 및 초기 체력 설정
        this.boss = new GoldPig(this, 600, 300);
        this.boss.setHealth(100);

        // 체력 게이지 생성
        this.bossHealthBar = new BossHealthBar(this);

        // 보스 체력 변경 이벤트 리스너 추가
        this.events.on("bossHealthChanged", this.updateBossHealthBar, this);

        // 초기 체력바 설정
        this.updateBossHealthBar(1);
        this.monsters.add(this.boss);
    }

    goToNextStage() {
        // 여기에 다음 스테이지나 게임 종료 로직을 구현할 수 있습니다.
        console.log("Game Completed!");
        this.scene.start("GameOverScene", { points: this.points });
    }

    update(time, delta) {
        super.update(time, delta);

        // 보스의 체력에 따라 체력 게이지 업데이트
        if (this.boss && this.bossHealthBar) {
            const healthPercentage = this.boss.health / 100;
            this.bossHealthBar.setValue(healthPercentage);
        }
    }
    updateBossHealthBar(healthPercentage) {
        if (this.bossHealthBar) {
            this.bossHealthBar.setValue(healthPercentage);
            console.log(`Updating health bar: ${healthPercentage}`);
        }
    }

    // 씬이 종료될 때 이벤트 리스너 제거
    shutdown() {
        this.events.off("bossHealthChanged", this.updateBossHealthBar, this);
        super.shutdown();
    }
}


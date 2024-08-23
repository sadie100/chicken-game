import { BaseScene } from "./BaseScene";
import { Pig } from "../gameobjects/monsters/Pig";
import { Cat } from "../gameobjects/monsters/Cat";
import { GoldPig } from "../gameobjects/monsters/GoldPig";
import { Background } from "../backgrounds/Background";

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
        const goldenPig = new GoldPig(this, 100, 100, 30);
        this.monsters.add(goldenPig);
    }

    goToNextStage() {
        // 여기에 다음 스테이지나 게임 종료 로직을 구현할 수 있습니다.
        console.log("Game Completed!");
        this.scene.start("GameOverScene", { points: this.points });
    }
}


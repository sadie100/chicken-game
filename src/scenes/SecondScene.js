import { BaseScene } from "./BaseScene";
import { Pig } from "../gameobjects/monsters/Pig";
import { Cat } from "../gameobjects/monsters/Cat";
import { Background } from "../backgrounds/Background";

export class SecondScene extends BaseScene {
    constructor() {
        super("SecondScene");
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
    }

    getBackground() {
        return new Background(this, "background2", 3);
    }

    createItems() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // SecondScene에서는 아이템 3과 4를 생성합니다 (예시)
        this.itemManager.addItem(
            centerX - 100,
            centerY,
            "itemList1",
            2,
            "item3"
        );
        this.itemManager.addItem(
            centerX + 100,
            centerY,
            "itemList1",
            3,
            "item4"
        );
    }

    spawnSingleMonster() {
        let x, y, direction;

        if (this.gameTime >= this.advancedSpawnTime) {
            const spawnArea = Math.random();
            if (spawnArea < 0.6) {
                x = this.scale.width;
                y = Phaser.Math.Between(0, this.scale.height);
                direction = "straight";
            } else if (spawnArea < 0.8) {
                x = Phaser.Math.Between(
                    this.scale.width * 0.7,
                    this.scale.width
                );
                y = 0;
                direction = "down";
            } else {
                x = Phaser.Math.Between(
                    this.scale.width * 0.7,
                    this.scale.width
                );
                y = this.scale.height;
                direction = "up";
            }
        } else {
            x = this.scale.width;
            y = Phaser.Math.Between(0, this.scale.height);
            direction = "straight";
        }

        if (Math.random() < 0.3) {
            // 30% 확률로 고양이 스폰
            const cat = new Cat(
                this,
                x,
                y,
                this.currentMonsterSpeed * 1.2,
                direction
            );
            this.monsters.add(cat);
        } else {
            const pig = new Pig(
                this,
                x,
                y,
                this.currentMonsterSpeed,
                direction
            );
            this.monsters.add(pig);
        }
    }

    goToNextStage() {
        // 여기에 다음 스테이지나 게임 종료 로직을 구현할 수 있습니다.
        console.log("Game Completed!");
        this.scene.start("GameOverScene", { points: this.points });
    }
}


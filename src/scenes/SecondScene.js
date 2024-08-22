import { BaseScene } from "./BaseScene";
import { Pig } from "../gameobjects/monsters/Pig";
import { Cat } from "../gameobjects/monsters/Cat";

export class SecondScene extends BaseScene {
    constructor() {
        super("SecondScene");
    }

    init(data) {
        this.points = data.points || 0;
        this.resetVariables();
        // 플레이어의 생명력을 이전 라운드에서 가져옵니다.
        if (data.lives) {
            this.player.setLives(data.lives);
        }
    }

    create() {
        super.create();
        // HUD의 생명력 표시 업데이트
        if (this.hudScene) {
            this.hudScene.updateLives(this.player.getLives());
        }
        this.add
            .text(this.scale.width / 2, 50, "2라운드 시작!", {
                fontSize: "32px",
                fill: "#fff",
            })
            .setOrigin(0.5);
    }

    getBackgroundKey() {
        return "background2";
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


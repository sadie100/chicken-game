import { BaseScene } from "./BaseScene";
import { Pig } from "../gameobjects/monsters/Pig";
import { Cat } from "../gameobjects/monsters/Cat";

export class SecondScene extends BaseScene {
    constructor() {
        super("SecondScene");
    }

    init(data) {
        this.points = data.points || 0;
        this.currentMonsterSpeed =
            data.currentMonsterSpeed || this.initialMonsterSpeed;
        this.currentSpawnDelay =
            data.currentSpawnDelay || this.initialSpawnDelay;
        this.monstersPerSpawn = data.monstersPerSpawn || 1;
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

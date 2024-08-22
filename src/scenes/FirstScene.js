import { BaseScene } from "./BaseScene";
import { Pig } from "../gameobjects/monsters/Pig";

export class FirstScene extends BaseScene {
    constructor() {
        super("FirstScene");
    }

    getBackgroundKey() {
        return "background1";
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

        const pig = new Pig(this, x, y, this.currentMonsterSpeed, direction);
        this.monsters.add(pig);
    }

    goToNextStage() {
        this.cameras.main.fade(1000, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("SecondScene", {
                points: this.points,
                currentMonsterSpeed: this.currentMonsterSpeed,
                currentSpawnDelay: this.currentSpawnDelay,
                monstersPerSpawn: this.monstersPerSpawn,
            });
        });
    }
}

import { BaseScene } from "./BaseScene";
import { Pig } from "../gameobjects/monsters/Pig";
import { Background } from "../backgrounds/Background";

export class FirstScene extends BaseScene {
    constructor() {
        super("FirstScene");
    }

    create() {
        super.create();
        // FirstScene 특정 생성 로직...

        // 전환 오버레이 페이드 아웃
        this.tweens.add({
            targets: this.transitionOverlay,
            alpha: 0,
            duration: 500,
            ease: "Power2",
        });
    }

    getBackground() {
        // FirstScene에 맞는 배경 키 반환
        return new Background(this, "background1", 4);
    }

    completeStage() {
        super.completeStage();
        // this.time.delayedCall(2000, () => {
        //     this.goToNextStage();
        // });
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

    // goToNextStage() {
    //     this.cameras.main.fade(1000, 0, 0, 0);
    //     this.cameras.main.once("camerafadeoutcomplete", () => {
    //         this.scene.start("SecondScene", {
    //             points: this.points,
    //             currentMonsterSpeed: this.currentMonsterSpeed,
    //             currentSpawnDelay: this.currentSpawnDelay,
    //             monstersPerSpawn: this.monstersPerSpawn,
    //         });
    //     });
    // }

    startNextRound() {
        super.startNextRound("SecondScene");
    }

    createItems() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // FirstScene에서는 아이템 1과 2를 생성합니다
        this.itemManager.addItem(
            centerX - 100,
            centerY,
            "itemList1",
            0,
            "item1"
        );
        this.itemManager.addItem(
            centerX + 100,
            centerY,
            "itemList1",
            1,
            "item2"
        );
    }
}


import { NormalScene } from "./NormalScene";
import { Pig } from "../gameobjects/monsters/Pig";
import { Background } from "../backgrounds/Background";

export class FirstScene extends NormalScene {
    constructor() {
        super("FirstScene");
    }

    create() {
        super.create();
        // FirstScene 특정 생성 로직...

        if (this.soundManager) {
            this.soundManager.addSound("bgm1", { loop: true, volume: 0.5 });
            this.soundManager.playSound("bgm1");
        } else {
            console.error("SoundManager not found in FirstScene");
        }

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
    }

    spawnSingleMonster() {
        const { x, y, direction } = this.getSpawnPosition();

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
            "BulletBooster"
        );
        this.itemManager.addItem(
            centerX + 100,
            centerY,
            "itemList1",
            1,
            "EggSpeedBooster"
        );
    }
}

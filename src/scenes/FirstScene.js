import { NormalScene } from "./NormalScene";
import { Pig } from "../gameobjects/monsters/Pig";
import { Background } from "../backgrounds/Background";

export class FirstScene extends NormalScene {
    constructor() {
        super("FirstScene");
    }

    // FirstScene 전용 스폰 설정
    getSpawnConfig() {
        return {
            stageTime: 60000,
            initialSpawnDelay: 900, // 초반은 조금 여유롭게
            minSpawnDelay: 550,
            spawnReductionRate: 150,
            initialMonsterSpeed: 72, // 기본보다 약간 느리게 시작
            monsterSpeedIncreaseRate: 2,
            middleSpawnTime: 25000,
            updownSpawnTime: 35000,
            advancedSpawnTime: 45000,
        };
    }

    create() {
        super.create();
        // FirstScene 특정 생성 로직...

        this.soundManager.changeBGM("bgm1");

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
}

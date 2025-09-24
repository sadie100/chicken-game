import { Pig } from "../gameobjects/monsters/Pig";
import { Cat } from "../gameobjects/monsters/Cat";
import { Background } from "../backgrounds/Background";
import { NormalScene } from "./NormalScene";

export class SecondScene extends NormalScene {
    constructor() {
        super("SecondScene");
    }

    init(data) {
        super.init(data);
    }

    // SecondScene 전용 스폰 설정
    getSpawnConfig() {
        return {
            initialSpawnDelay: 750, // 더 빠르게 시작
            minSpawnDelay: 450,
            spawnReductionRate: 180,
            initialMonsterSpeed: 200, // 약간 빠름
            monsterSpeedIncreaseRate: 5,
        };
    }

    getBackground() {
        return new Background(this, "background2", 3);
    }

    create() {
        super.create();
        this.soundManager.changeBGM("bgm2");
    }

    spawnSingleMonster() {
        const { x, y, direction } = this.getSpawnPosition();

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

    startNextRound() {
        super.startNextRound("BossScene");
    }
}

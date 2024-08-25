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
            "SpeedBooster"
        );
        this.itemManager.addItem(
            centerX + 100,
            centerY,
            "itemList1",
            3,
            "EggSizeBooster"
        );
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


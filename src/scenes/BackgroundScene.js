import { Scene } from "phaser";
import { Background } from "../backgrounds/Background";

export class BackgroundScene extends Scene {
    constructor() {
        super("BackgroundScene");
    }

    preload() {
        // 이 씬은 프리로더보다 먼저/병렬로 background1만 빠르게 로드한다
        this.load.setPath("assets");
        for (let i = 1; i <= 4; i++) {
            this.load.image(
                `background1_${i}`,
                `backgrounds/background1/${i}.png`
            );
        }
    }

    create() {
        this.cameras.main.setBackgroundColor("#1c172e");
        this.background = new Background(this, "background1", 4);
        this.background.create();

        // 항상 맨 뒤로 보내 UI/다른 씬과 겹치지 않게 한다
        this.scene.sendToBack();
    }

    update(time, delta) {
        if (this.background) {
            this.background.update(delta);
        }
    }
}


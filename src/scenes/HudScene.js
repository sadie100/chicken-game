import { Scene } from "phaser";

export class HudScene extends Scene {
    points_text;
    lives_group;

    constructor() {
        super("HudScene");
    }

    create() {
        // 생명력 UI 생성
        this.lives_group = this.add.group();
        this.updateLives(5); // 초기 생명력 설정

        // 점수 텍스트 생성 (생명력 UI 아래에 위치)
        this.points_text = this.add.bitmapText(
            10,
            50,
            "pixelfont",
            "POINTS:0000",
            24
        );
    }

    update_points(points) {
        this.points_text.setText(
            `POINTS:${points.toString().padStart(4, "0")}`
        );
    }

    updateLives(lives) {
        this.lives_group.clear(true, true);
        for (let i = 0; i < lives; i++) {
            const life = this.add.image(20 + i * 30, 25, "life").setScale(1.5);
            this.lives_group.add(life);
        }
    }
}


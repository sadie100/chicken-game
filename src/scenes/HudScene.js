import { Scene } from "phaser";

export class HudScene extends Scene {
    points_text;
    lives_group;
    time_text;
    bullet_info_text;

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

        // 시간 텍스트 생성 (우측 상단에 위치)
        this.time_text = this.add.bitmapText(
            this.scale.width - 10,
            10,
            "pixelfont",
            "TIME: 00:00",
            24
        );
        this.time_text.setOrigin(1, 0); // 우측 상단 정렬

        // 총알 정보 텍스트 생성 (우측 하단에 위치)
        this.bullet_info_text = this.add.text(
            this.scale.width - 10,
            this.scale.height - 10,
            "",
            { fontSize: 20 }
        );
        this.bullet_info_text.setOrigin(1, 1); // 우측 하단 정렬
    }

    update_points(points) {
        this.points_text.setText(
            `POINTS:${points.toString().padStart(4, "0")}`
        );
    }

    updateLives(lives) {
        if (!this.lives_group) {
            this.create();
        }
        this.lives_group.clear(true, true);
        for (let i = 0; i < lives; i++) {
            const life = this.add.image(20 + i * 30, 25, "life").setScale(1.5);
            this.lives_group.add(life);
        }
    }

    updateTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.time_text.setText(
            `TIME: ${minutes.toString().padStart(2, "0")}:${remainingSeconds
                .toString()
                .padStart(2, "0")}`
        );
    }

    updateBulletInfo(text) {
        if (this.bullet_info_text) {
            this.bullet_info_text.setText(text);
        }
    }
}


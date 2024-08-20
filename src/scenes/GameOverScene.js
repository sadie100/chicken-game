import { Scene } from "phaser";

export class GameOverScene extends Scene {
    end_points = 0;
    constructor() {
        super("GameOverScene");
    }

    init(data) {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.end_points = data.points || 0;
    }

    create() {
        // Backgrounds
        this.add.image(0, 0, "farm_background").setOrigin(0, 0);
        this.add.image(0, this.scale.height, "farm_floor").setOrigin(0, 1);

        // Rectangles to show the text
        // Background rectangles
        this.add
            .rectangle(
                0,
                this.scale.height / 2,
                this.scale.width,
                120,
                0xffffff
            )
            .setAlpha(0.8)
            .setOrigin(0, 0.5);
        this.add
            .rectangle(
                0,
                this.scale.height / 2 + 105,
                this.scale.width,
                90,
                0x000000
            )
            .setAlpha(0.8)
            .setOrigin(0, 0.5);

        // Game Over 텍스트
        this.add
            .text(this.scale.width / 2, this.scale.height / 2, "GAME\nOVER", {
                fontFamily: "Arial",
                fontSize: 62,
                color: "#000000",
                align: "center",
            })
            .setOrigin(0.5, 0.5);

        // 점수 표시
        this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 2 + 85,
                `YOUR POINTS: ${this.end_points}`,
                { fontFamily: "Arial", fontSize: 24, color: "#ffffff" }
            )
            .setOrigin(0.5, 0.5);

        // 재시작 안내
        this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 2 + 130,
                "CLICK TO RESTART",
                { fontFamily: "Arial", fontSize: 24, color: "#ffffff" }
            )
            .setOrigin(0.5, 0.5);

        // Click to restart
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.input.on("pointerdown", () => {
                    this.scene.start("MainScene");
                });
            },
        });
    }
}

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
        const wallpaper = this.add
            .image(this.x, this.y, "gameover")
            .setOrigin(0, 0);
        wallpaper.setDisplaySize(this.scale.width, this.scale.height);
        wallpaper.setTint(0x808080);

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
                fontFamily: "pixel",
                fontSize: 62,
                color: "#000000",
                align: "center",
            })
            .setOrigin(0.5, 0.5);

        // 점수 표시
        this.add
            .bitmapText(
                this.scale.width / 2,
                this.scale.height / 2 + 85,
                "pixelfont",
                `YOUR POINTS: ${this.end_points}`,
                24
            )
            .setOrigin(0.5, 0.5);

        // 재시작 안내
        this.add
            .bitmapText(
                this.scale.width / 2,
                this.scale.height / 2 + 130,
                "pixelfont",
                "CLICK TO RESTART",
                24
            )
            .setOrigin(0.5, 0.5);

        // Click to restart
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.input.on("pointerdown", () => {
                    this.scene.start("FirstScene");
                });
            },
        });
    }
}


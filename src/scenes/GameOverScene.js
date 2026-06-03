import { Scene } from "phaser";

export class GameOverScene extends Scene {
    constructor() {
        super("GameOverScene");
    }

    init(data) {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.end_points = data.points || 0;
    }

    create() {
        // 병렬로 떠 있던 HUD 정리 (메뉴/게임오버 위에 잔상 방지)
        this.scene.stop("HudScene");

        // Get SoundManager from registry
        this.soundManager = this.game.registry.get("soundManager");
        this.soundManager.stopCurrentBGM();
        this.soundManager.playSound("gameover", { volume: 0.5 });

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
                fontFamily: "Galmuri11",
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
                { fontSize: 24, color: "#ffffff" }
            )
            .setOrigin(0.5, 0.5);

        // 메뉴 복귀 안내
        this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 2 + 130,
                "CLICK TO MENU",
                { fontSize: 24, color: "#ffffff" }
            )
            .setOrigin(0.5, 0.5);

        // 클릭 시 메뉴로 이동
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.input.on("pointerdown", () => {
                    this.scene.start("MenuScene");
                });
            },
        });
    }
}

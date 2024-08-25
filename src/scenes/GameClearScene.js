import { Scene } from "phaser";

export class GameClearScene extends Scene {
    lastPlayedScene = "FirstScene"; // Default to FirstScene

    constructor() {
        super("GameClearScene");
    }

    init(data) {
        this.cameras.main.fadeIn(2000, 0, 0, 0);
        this.end_points = data.points || 0;
        this.lastPlayedScene = data.lastPlayedScene || "FirstScene";
    }

    create() {
        // Backgrounds
        const wallpaper = this.add
            .image(this.x, this.y, "ending")
            .setOrigin(0, 0);
        wallpaper.setDisplaySize(this.scale.width, this.scale.height);

        // 스토리 텍스트 설정
        const storyText = this.add.text(
            this.scale.width / 2,
            this.scale.height,
            `꼬꼬는 황금 돼지를 무찌르고\n
            소중한 아기 병아리를 구하는 데 성공했다.\n
            마을로 돌아온 꼬꼬는\n
            영웅으로 환영받았다.\n
            커다란 용기와 지혜로운 선택으로\n
            마을을 구한 꼬꼬는\n
            마을의 영웅으로 기억될 것이다.\n\n

            당신의 점수 : ${this.end_points}\n\n
            플레이 해주셔서 감사합니다.\n`,
            {
                font: "32px Arial",
                fill: "#ffffff",
                align: "center",
                wordWrap: {
                    width: this.scale.width - 100,
                    useAdvancedWrap: true,
                }, // 자동 줄바꿈
                backgroundColor: "#646464",
                width: this.scale.width - 100,
                padding: 20,
            }
        );
        storyText.setOrigin(0.5, 0); // 텍스트의 기준점을 아래 가운데로 설정
        storyText.setAlpha(0.9);
        // 2초 딜레이 후 텍스트 애니메이션 시작
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: storyText,
                y: -storyText.height, // 텍스트가 위로 완전히 올라가도록 설정
                ease: "Linear",
                duration: 20000, // 12초 동안 애니메이션
                onComplete: () => {
                    this.cameras.main.fadeOut(2000, 0, 0, 0);

                    this.scene.stop();
                    this.scene.start("MenuScene");
                },
            });
        });

        // 재시작 안내
        this.add
            .bitmapText(
                this.scale.width - 10,
                this.scale.height - 10,
                "pixelfont",
                "CLICK TO SKIP",
                20
            )
            .setOrigin(1, 1);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.input.on("pointerdown", () => {
                    this.resetGame();
                });
            },
        });
    }
    resetGame() {
        // 모든 활성 Scene을 종료
        this.scene.manager.scenes.forEach((scene) => {
            if (scene.scene.isActive()) {
                this.scene.stop(scene.scene.key);
            }
        });

        // MenuScene 시작
        this.scene.start("MenuScene");
    }
}


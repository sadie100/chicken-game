import { Scene } from "phaser";
import { t, onLanguageChanged } from "../i18n/i18n";

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
        // Get SoundManager from registry
        this.soundManager = this.game.registry.get("soundManager");
        this.soundManager.changeBGM("gameclear");

        // Backgrounds
        const wallpaper = this.add
            .image(this.x, this.y, "ending")
            .setOrigin(0, 0);
        wallpaper.setDisplaySize(this.scale.width, this.scale.height);

        // 스토리 텍스트 설정
        const storyText = this.add.text(
            this.scale.width / 2,
            this.scale.height,
            t("gameclear.story", { score: this.end_points }),
            {
                font: "10px Arial",
                fill: "#ffffff",
                align: "center",
                wordWrap: {
                    width: this.scale.width - 30,
                    useAdvancedWrap: true,
                }, // 자동 줄바꿈
                backgroundColor: "#646464",
                width: this.scale.width - 30,
                padding: 6,
            }
        );
        this._i18nUnsub = onLanguageChanged(() => {
            storyText.setText(t("gameclear.story", { score: this.end_points }));
        });
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
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._i18nUnsub) {
                this._i18nUnsub();
                this._i18nUnsub = null;
            }
        });

        // 재시작 안내
        this.add
            .bitmapText(
                this.scale.width - 6,
                this.scale.height - 6,
                "pixelfont",
                t("gameclear.skip"),
                8
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


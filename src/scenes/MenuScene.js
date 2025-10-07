import { Scene } from "phaser";
import { Button } from "../gameobjects/Button";
import {
    t,
    changeLanguage,
    onLanguageChanged,
    currentLanguage,
} from "../i18n/i18n";
// import { MAX_STACK } from "../config/items";

export class MenuScene extends Scene {
    constructor() {
        super("MenuScene");
    }

    init() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    create() {
        // Backgrounds
        const wallpaper = this.add
            .image(this.x, this.y, "menu")
            .setOrigin(0, 0);
        wallpaper.setDisplaySize(this.scale.width, this.scale.height);

        this.add
            .rectangle(
                0,
                this.scale.height / 4,
                this.scale.width,
                120,
                0xffffff
            )
            .setAlpha(0.8)
            .setOrigin(0, 0.5);

        // Logo
        this.logo_game = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4,
            t("menu.title"),
            {
                fontFamily: "Impact",
                fontSize: 52,
                color: "#000000",
                fontStyle: "bold",
            }
        );
        this.logo_game.setOrigin(0.5, 0.5);
        this.logo_game.postFX.addShine();

        this.playBtn = new Button({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2,
            text: t("menu.play"),
            onClick: () => {
                this.scene.stop("MenuScene");
                this.scene.start("HudScene");
                this.scene.start("FirstScene", { restart: true });

                // // 테스트용: 보스 씬으로 바로 이동, 모든 아이템 최대치
                // this.scene.start("BossScene", {
                //     restart: true,
                //     effects: {
                //         bullet: MAX_STACK.bullet,
                //         eggSpeed: MAX_STACK.eggSpeed,
                //         eggSize: MAX_STACK.eggSize,
                //         speed: MAX_STACK.speed,
                //         powerEgg: 0, // PowerEgg는 시간 제한이 있어서 0으로 시작
                //     },
                // });
            },
        });

        this.helpBtn = new Button({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 + 85,
            text: t("menu.help"),
            onClick: () => {
                this.showDialog();
            },
        });

        // Language toggle (KO/EN)
        this.langBtn = new Button({
            scene: this,
            x: this.scale.width - 100,
            y: 40,
            text: currentLanguage().toUpperCase().startsWith("en")
                ? "EN"
                : "KO",
            onClick: async () => {
                const next = currentLanguage().startsWith("en") ? "ko" : "en";
                await changeLanguage(next);
            },
        });

        this.createDialog();

        // 언어 변경 시 즉시 UI 갱신
        this.refreshTexts = () => {
            this.logo_game.setText(t("menu.title"));
            this.playBtn.button.setText(t("menu.play"));
            this.helpBtn.button.setText(t("menu.help"));
            if (this.dialogContent) {
                this.dialogContent.setText(t("menu.story"));
            }
            this.langBtn.button.setText(
                currentLanguage().startsWith("en") ? "EN" : "KO"
            );
        };
        this._i18nUnsub = onLanguageChanged(this.refreshTexts);
    }

    createDialog() {
        const width = 500;
        const height = this.cameras.main.height * 0.8;

        this.dialog = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );

        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x000000);

        const closeButton = this.add.image(
            width / 2 - 20,
            -height / 2 + 20,
            "close"
        );
        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on("pointerdown", () => this.hideDialog());

        this.dialogContent = this.add.text(0, 0, t("menu.story"), {
            fontSize: "24px",
            color: "#000000",
            wordWrap: { width: width - 40, useAdvancedWrap: true },
            lineSpacing: 10,
        });
        this.dialogContent.setOrigin(0.5);

        this.dialog.add([background, closeButton, this.dialogContent]);
        this.dialog.setSize(width, height);
        this.dialog.setVisible(false);
    }

    showDialog() {
        this.dialog.setVisible(true);
    }

    hideDialog() {
        this.dialog.setVisible(false);
    }
    shutdown() {
        if (this._i18nUnsub) {
            this._i18nUnsub();
            this._i18nUnsub = null;
        }
    }
}


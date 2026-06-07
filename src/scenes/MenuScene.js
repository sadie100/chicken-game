import { Scene } from "phaser";
import { Button } from "../gameobjects/Button";
import { Background } from "../backgrounds/Background";
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
        const w = this.scale.width;
        const h = this.scale.height;

        // 스크롤되는 패럴랙스 배경 (게임 본편과 동일한 레이어 재사용)
        this.background = new Background(this, "background1", 4);
        this.background.create();

        // 로고 (픽셀 폰트 + 크림색 패널 + 잔잔한 바운스)
        this.titleContainer = this.add.container(w / 2, h * 0.21);
        this.titlePanel = this.add.graphics();
        this.logo_game = this.add
            .text(0, 0, t("menu.title"), {
                fontFamily: "Galmuri11",
                fontSize: 54,
                color: "#4a2f00",
            })
            .setOrigin(0.5);
        this.titleContainer.add([this.titlePanel, this.logo_game]);
        this.drawTitlePanel();
        this.logo_game.postFX.addShine();
        this.tweens.add({
            targets: this.titleContainer,
            y: h * 0.21 - 8,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut",
        });

        this.playBtn = new Button({
            scene: this,
            primary: true,
            x: w / 2,
            y: h * 0.56,
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
            y: this.scale.height * 0.56 + 90,
            text: t("menu.help"),
            onClick: () => {
                this.showDialog();
            },
        });

        // Language toggle (KO/EN)
        this.langBtn = new Button({
            scene: this,
            x: this.scale.width - 80,
            y: 48,
            width: 90,
            height: 52,
            fontSize: 24,
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
            this.drawTitlePanel();
            this.playBtn.button.setText(t("menu.play"));
            this.helpBtn.button.setText(t("menu.help"));
            if (this.dialogContent) {
                this.dialogContent.setText(t("menu.story"));
            }
            this.langBtn.button.setText(
                currentLanguage().startsWith("en") ? "EN" : "KO",
            );
        };
        this._i18nUnsub = onLanguageChanged(this.refreshTexts);
    }

    update(time, delta) {
        if (this.background) {
            this.background.update(delta);
        }
    }

    // 제목 텍스트 크기에 맞춰 크림색 패널을 다시 그린다 (언어 전환 대응)
    drawTitlePanel() {
        const padX = 36;
        const padY = 16;
        const tw = this.logo_game.width + padX * 2;
        const th = this.logo_game.height + padY * 2;
        const g = this.titlePanel;
        g.clear();
        g.fillStyle(0x8a5e10, 1);
        g.fillRoundedRect(-tw / 2, -th / 2 + 6, tw, th, 18);
        g.fillStyle(0xfff8e7, 0.95);
        g.fillRoundedRect(-tw / 2, -th / 2, tw, th, 18);
        g.lineStyle(4, 0xb9831a, 1);
        g.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 18);
    }

    createDialog() {
        const width = 500;
        const height = this.cameras.main.height * 0.8;

        this.dialog = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
        );

        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x000000);

        const closeButton = this.add.image(
            width / 2 - 20,
            -height / 2 + 20,
            "close",
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

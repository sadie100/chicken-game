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
            text: currentLanguage().startsWith("en") ? "EN" : "KO",
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
            if (this.dialogTitle) {
                this.dialogTitle.setText(t("menu.help"));
            }
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
        const w = this.scale.width;
        const h = this.scale.height;
        const panelW = 540;
        const panelH = h * 0.74;
        const r = 22;
        const headerH = 62;

        this.dialog = this.add.container(w / 2, h / 2).setDepth(100);

        // 배경 스크림 — 바깥을 클릭하면 닫힌다
        this.dialogScrim = this.add
            .rectangle(0, 0, w, h, 0x000000, 0.55)
            .setInteractive({ useHandCursor: false });
        this.dialogScrim.on("pointerup", () => this.hideDialog());

        // 팝 애니메이션 대상 (스크림 제외)
        this.dialogPanel = this.add.container(0, 0);

        // 패널 (크림색 + 골든 테두리 + 드롭섀도우)
        const panel = this.add.graphics();
        panel.fillStyle(0x8a5e10, 1);
        panel.fillRoundedRect(-panelW / 2, -panelH / 2 + 8, panelW, panelH, r);
        panel.fillStyle(0xfff8e7, 1);
        panel.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, r);
        panel.lineStyle(5, 0xb9831a, 1);
        panel.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, r);

        // 헤더 띠 (제목)
        const header = this.add.graphics();
        header.fillStyle(0xffcf3f, 1);
        header.fillRoundedRect(-panelW / 2 + 5, -panelH / 2 + 5, panelW - 10, headerH, {
            tl: r - 3,
            tr: r - 3,
            bl: 0,
            br: 0,
        });
        header.lineStyle(3, 0xb9831a, 1);
        header.lineBetween(
            -panelW / 2 + 5,
            -panelH / 2 + 5 + headerH,
            panelW / 2 - 5,
            -panelH / 2 + 5 + headerH,
        );

        this.dialogTitle = this.add
            .text(0, -panelH / 2 + 5 + headerH / 2, t("menu.help"), {
                fontFamily: "Galmuri11",
                fontSize: 30,
                color: "#4a2f00",
            })
            .setOrigin(0.5);

        // 패널 안쪽 클릭이 스크림으로 새지 않도록 막는다
        const blocker = this.add
            .rectangle(0, 0, panelW, panelH, 0x000000, 0)
            .setInteractive();

        this.dialogContent = this.add
            .text(0, headerH / 2, t("menu.story"), {
                fontFamily: "Galmuri11",
                fontSize: 22,
                color: "#4a3a1a",
                wordWrap: { width: panelW - 60, useAdvancedWrap: true },
                lineSpacing: 12,
            })
            .setOrigin(0.5);

        const closeBtn = this.createCloseButton(
            panelW / 2 - 30,
            -panelH / 2 + 30,
        );

        this.dialogPanel.add([
            panel,
            header,
            blocker,
            this.dialogTitle,
            this.dialogContent,
            closeBtn,
        ]);
        this.dialog.add([this.dialogScrim, this.dialogPanel]);
        this.dialog.setVisible(false);
    }

    // 빨간 픽셀 닫기 버튼 (hover 확대 / press 눌림)
    createCloseButton(x, y) {
        const size = 44;
        const r = 12;
        const offset = 4;
        const c = this.add.container(x, y);

        const shadow = this.add.graphics();
        shadow.fillStyle(0x8f2b21, 1);
        shadow.fillRoundedRect(-size / 2, -size / 2 + offset, size, size, r);

        const face = this.add.graphics();
        const draw = (fill) => {
            face.clear();
            face.fillStyle(fill, 1);
            face.fillRoundedRect(-size / 2, -size / 2, size, size, r);
            face.lineStyle(3, 0xc23b2e, 1);
            face.strokeRoundedRect(-size / 2, -size / 2, size, size, r);
            face.lineStyle(4, 0xffffff, 1);
            face.beginPath();
            face.moveTo(-8, -8);
            face.lineTo(8, 8);
            face.moveTo(8, -8);
            face.lineTo(-8, 8);
            face.strokePath();
        };
        draw(0xff6b5b);

        c.add([shadow, face]);
        c.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -size / 2,
                -size / 2,
                size,
                size + offset,
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true,
        });
        c.on("pointerover", () => {
            draw(0xff8779);
            this.tweens.add({
                targets: c,
                scaleX: 1.12,
                scaleY: 1.12,
                duration: 100,
                ease: "Back.out",
            });
        });
        c.on("pointerout", () => {
            draw(0xff6b5b);
            face.y = 0;
            this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 100 });
        });
        c.on("pointerdown", () => {
            draw(0xe5503f);
            face.y = offset;
        });
        c.on("pointerup", () => {
            draw(0xff8779);
            face.y = 0;
            this.hideDialog();
        });
        return c;
    }

    showDialog() {
        this.dialog.setVisible(true);
        this.dialogScrim.setAlpha(0);
        this.dialogPanel.setScale(0.92);
        this.tweens.add({
            targets: this.dialogScrim,
            alpha: 0.55,
            duration: 150,
        });
        this.tweens.add({
            targets: this.dialogPanel,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: "Back.out",
        });
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

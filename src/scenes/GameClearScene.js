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

        const w = this.scale.width;
        const h = this.scale.height;

        // 배경 (파란 하늘 + 무지개 + 구름 — 일러스트 없이 그래픽으로)
        this.createSkyBackground();

        // 스토리 텍스트 (엔딩 크레딧 스크롤)
        const storyText = this.add.text(
            w / 2,
            h,
            t("gameclear.story", { score: this.end_points }),
            {
                fontFamily: "Galmuri11",
                fontSize: "32px",
                color: "#3a2a10",
                align: "center",
                lineSpacing: 14,
                wordWrap: {
                    width: w - 100,
                    useAdvancedWrap: true,
                }, // 자동 줄바꿈
            }
        );
        // 밝은 하늘/무지개 위에서도 읽히도록 흰 외곽선
        storyText.setStroke("#ffffff", 6);
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
            .text(
                this.scale.width - 14,
                this.scale.height - 12,
                t("gameclear.skip"),
                { fontSize: 20, color: "#3a2a10" }
            )
            .setOrigin(1, 1)
            .setStroke("#ffffff", 4)
            .setAlpha(0.85);

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.input.on("pointerdown", () => {
                    this.resetGame();
                });
            },
        });
    }
    createSkyBackground() {
        const w = this.scale.width;
        const h = this.scale.height;

        // 하늘 그라데이션 (위 진한 파랑 → 아래 옅은 하늘색)
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x4ea8f0, 0x4ea8f0, 0xcdeeff, 0xcdeeff, 1);
        sky.fillRect(0, 0, w, h);

        // 반원 무지개 (위쪽을 감싸는 아치)
        const colors = [
            0xff6b6b, 0xffa94d, 0xffe066, 0x69db7c, 0x4dabf7, 0x5c7cfa,
            0x9775fa,
        ];
        const cx = w / 2;
        const cy = h * 0.95;
        const band = 18;
        // 바깥 반지름을 화면 폭 절반보다 크게 잡아 양 끝이 좌우 가장자리에 닿게 한다
        let radius = w / 2 + band;
        const rainbow = this.add.graphics();
        colors.forEach((col) => {
            rainbow.lineStyle(band, col, 0.65);
            rainbow.beginPath();
            rainbow.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
            rainbow.strokePath();
            radius -= band;
        });

        // 둥실 떠다니는 구름
        this.makeCloud(w * 0.16, h * 0.2, 1.3);
        this.makeCloud(w * 0.82, h * 0.16, 1.1);
        this.makeCloud(w * 0.7, h * 0.4, 0.9);
        this.makeCloud(w * 0.28, h * 0.52, 1.0);
    }

    makeCloud(x, y, s) {
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(0, 0, 26 * s);
        g.fillCircle(32 * s, 8 * s, 20 * s);
        g.fillCircle(-32 * s, 8 * s, 20 * s);
        g.fillRoundedRect(-46 * s, 8 * s, 92 * s, 24 * s, 12 * s);
        g.setPosition(x, y);
        this.tweens.add({
            targets: g,
            x: x + 45,
            duration: Phaser.Math.Between(5000, 8000),
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut",
        });
        return g;
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


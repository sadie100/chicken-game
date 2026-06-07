import { Scene } from "phaser";
import { t } from "../i18n/i18n";

export class ContinueScene extends Scene {
    constructor() {
        super("ContinueScene");
    }

    init(data) {
        this.parentSceneKey = data.parentSceneKey || "FirstScene";
        this.points = data.points || 0;
        this.countdown = 10;
        this.resolved = false;
    }

    create() {
        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        // 전체화면 반투명 오버레이
        this.add
            .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
            .setOrigin(0)
            .setAlpha(0.6);

        // GAME OVER 텍스트
        this.add
            .text(cx, cy - 120, t("continue.title"), {
                fontFamily: "Galmuri11",
                fontSize: 62,
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5);

        // Continue? 문구
        this.add
            .text(cx, cy - 40, t("continue.prompt"), {
                fontFamily: "Galmuri11",
                fontSize: 32,
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5);

        // 카운트다운 숫자
        this.countdown_text = this.add
            .text(cx, cy + 50, `${this.countdown}`, {
                fontFamily: "Galmuri11",
                fontSize: 96,
                color: "#ffeb3b",
                align: "center",
            })
            .setOrigin(0.5);

        // 입력 안내
        this.add
            .text(cx, cy + 140, t("continue.hint"), {
                fontSize: 20,
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5);

        // 1초마다 카운트다운 감소
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: this.tick,
            callbackScope: this,
        });

        // 부활 입력
        this.input.keyboard.on("keydown-ENTER", this.onContinue, this);
        this.input.on("pointerdown", this.onContinue, this);
    }

    tick() {
        this.countdown -= 1;
        if (this.countdown <= 0) {
            this.countdown_text.setText("0");
            this.onTimeout();
            return;
        }
        this.countdown_text.setText(`${this.countdown}`);
    }

    onContinue() {
        if (this.resolved) {
            return;
        }
        this.resolved = true;
        if (this.countdownTimer) {
            this.countdownTimer.remove();
        }
        this.scene.resume(this.parentSceneKey);
        this.scene.get(this.parentSceneKey).events.emit("revive");
        this.scene.stop();
    }

    onTimeout() {
        if (this.resolved) {
            return;
        }
        this.resolved = true;
        if (this.countdownTimer) {
            this.countdownTimer.remove();
        }
        this.scene.stop(this.parentSceneKey);
        this.scene.start("GameOverScene", { points: this.points });
        this.scene.stop();
    }
}

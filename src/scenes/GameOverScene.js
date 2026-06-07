import { Scene } from "phaser";
import { Button } from "../gameobjects/Button";

export class GameOverScene extends Scene {
    constructor() {
        super("GameOverScene");
    }

    init(data) {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.end_points = data.points || 0;
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // 병렬로 떠 있던 HUD 정리 (메뉴/게임오버 위에 잔상 방지)
        this.scene.stop("HudScene");

        // Get SoundManager from registry
        this.soundManager = this.game.registry.get("soundManager");
        this.soundManager.stopCurrentBGM();
        this.soundManager.playSound("gameover", { volume: 0.5 });

        // 배경 (단색 다크 톤 — 일러스트 제거)
        this.add.rectangle(0, 0, w, h, 0x1c172e).setOrigin(0, 0);

        // 크림색 패널 (메뉴/다이얼로그와 동일 톤)
        const panelW = 440;
        const panelH = 380;
        const r = 22;
        const panel = this.add.container(w / 2, h / 2);

        const g = this.add.graphics();
        g.fillStyle(0x8a5e10, 1);
        g.fillRoundedRect(-panelW / 2, -panelH / 2 + 8, panelW, panelH, r);
        g.fillStyle(0xfff8e7, 1);
        g.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, r);
        g.lineStyle(5, 0xb9831a, 1);
        g.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, r);
        // 제목과 점수 사이 골든 구분선
        g.lineStyle(3, 0xb9831a, 1);
        g.lineBetween(-panelW / 2 + 40, 10, panelW / 2 - 40, 10);

        const title = this.add
            .text(0, -85, "GAME\nOVER", {
                fontFamily: "Galmuri11",
                fontSize: 60,
                color: "#4a2f00",
                align: "center",
                lineSpacing: 4,
            })
            .setOrigin(0.5);

        const score = this.add
            .text(0, 55, `YOUR POINTS: ${this.end_points}`, {
                fontFamily: "Galmuri11",
                fontSize: 24,
                color: "#4a3a1a",
            })
            .setOrigin(0.5);

        const menuBtn = new Button({
            scene: this,
            primary: true,
            x: 0,
            y: 130,
            width: 240,
            text: "MENU",
            onClick: () => this.scene.start("MenuScene"),
        });

        panel.add([g, title, score, menuBtn.container]);

        // 1초 뒤부터는 화면 아무 곳이나 클릭해도 메뉴로 이동
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

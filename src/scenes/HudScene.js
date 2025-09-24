import { Scene } from "phaser";
import { ITEM_DEFS } from "../config/items";

export class HudScene extends Scene {
    points_text;
    lives_group;
    time_text;
    bullet_info_text;
    effectNodes;

    constructor() {
        super("HudScene");
    }

    create() {
        // 생명력 UI 생성
        this.lives_group = this.add.group();

        // 점수 텍스트 생성 (생명력 UI 아래에 위치)
        this.points_text = this.add.bitmapText(
            10,
            50,
            "pixelfont",
            "POINTS:0000",
            24
        );

        // 시간 텍스트 생성 (우측 상단에 위치)
        this.time_text = this.add.bitmapText(
            this.scale.width - 10,
            10,
            "pixelfont",
            "TIME: 00:00",
            24
        );
        this.time_text.setOrigin(1, 0); // 우측 상단 정렬

        // 총알 정보 텍스트 생성 (우측 하단에 위치)
        this.bullet_info_text = this.add.text(
            this.scale.width - 10,
            this.scale.height - 10,
            "",
            { fontSize: 20 }
        );
        this.bullet_info_text.setOrigin(1, 1); // 우측 하단 정렬

        // Initialize SoundManager
        this.initializeSoundManager();
        this.effectNodes = [];
    }

    updateEffects(effects) {
        // 기존 노드 제거
        if (this.effectNodes && this.effectNodes.length) {
            this.effectNodes.forEach((n) => n.destroy());
            this.effectNodes = [];
        }

        const mapping = [
            { key: "bullet", label: "대미지", id: "BulletBooster" },
            { key: "eggSize", label: "알크기", id: "EggSizeBooster" },
            { key: "eggSpeed", label: "발사속도", id: "EggSpeedBooster" },
            { key: "speed", label: "이동속도", id: "SpeedBooster" },
        ];

        const rows = mapping.map((m) => ({ ...m, count: effects[m.key] || 0 }));

        // 기존 텍스트는 지움(겹치지 않도록)
        this.updateBulletInfo("");

        const marginRight = 10;
        const marginBottom = 10;
        const lineGap = 6;
        const iconBaseSize = 16; // 스프라이트 기본 프레임 크기
        const iconTarget = 24; // 표시 크기(px)
        const textStyle = { fontSize: 16, color: "#ffffff" };

        let cursorY = this.scale.height - marginBottom;

        // 우하단 정렬: 아래 → 위로 쌓기
        for (const row of rows) {
            const def = ITEM_DEFS[row.id];
            const fallbackFrames = {
                bullet: 0,
                eggSpeed: 1,
                speed: 3,
                eggSize: 2,
            };
            const texture = def?.texture || "itemList1";
            const frame = def?.frame ?? fallbackFrames[row.key] ?? 0;

            const textObj = this.add.text(
                this.scale.width - marginRight,
                cursorY,
                `${row.label} : ${row.count}`,
                textStyle
            );
            textObj.setOrigin(1, 1);

            const icon = this.add.image(
                textObj.x - textObj.displayWidth - 8,
                cursorY,
                texture,
                frame
            );
            icon.setOrigin(1, 1);
            icon.setScale(iconTarget / iconBaseSize);

            this.effectNodes.push(textObj, icon);
            cursorY -=
                Math.max(icon.displayHeight, textObj.displayHeight) + lineGap;
        }
    }

    update_points(points) {
        if (this.points_text) {
            this.points_text.setText(
                `POINTS:${points.toString().padStart(4, "0")}`
            );
        }
    }

    updateLives(lives) {
        if (this.lives_group) {
            this.lives_group.clear(true, true);
            for (let i = 0; i < lives; i++) {
                const life = this.add
                    .image(20 + i * 30, 25, "life")
                    .setScale(1.5);
                this.lives_group.add(life);
            }
        }
    }

    updateTime(seconds) {
        if (this.time_text) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            this.time_text.setText(
                `TIME: ${minutes.toString().padStart(2, "0")}:${remainingSeconds
                    .toString()
                    .padStart(2, "0")}`
            );
        }
    }

    updateBulletInfo(text) {
        if (this.bullet_info_text) {
            this.bullet_info_text.setText(text);
        }
    }

    initializeSoundManager() {
        this.soundManager = this.game.registry.get("soundManager");
        if (this.soundManager) {
            this.soundManager.setScene(this);
        } else {
            console.error("SoundManager not found in registry");
        }
    }
}

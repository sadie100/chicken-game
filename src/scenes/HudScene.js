import { Scene } from "phaser";

export class HudScene extends Scene {
    points_text;
    lives_group;
    time_text;
    bullet_info_text;

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
            this.createVolumeControl();
        } else {
            console.error("SoundManager not found in registry");
        }
    }

    createVolumeControl() {
        const width = 150;
        const height = 15;
        const x = 10;
        const y = this.scale.height - 30;

        // 배경 생성
        const background = this.add.rectangle(0, 0, width, height, 0x333333);
        background.setOrigin(0, 0.5);

        // 볼륨 레벨을 나타내는 막대 생성
        this.volumeBar = this.add.rectangle(
            0,
            0,
            width * this.soundManager.volume,
            height,
            0x00ff00
        );
        this.volumeBar.setOrigin(0, 0.5);

        // 슬라이더 핸들 생성
        this.handle = this.add.circle(
            width * this.soundManager.volume,
            0,
            height / 2 + 5,
            0xffffff
        );
        this.handle.setInteractive({ draggable: true });

        // 드래그 이벤트 처리
        this.handle.on("drag", (pointer, dragX) => {
            dragX = Phaser.Math.Clamp(dragX, 0, width);
            this.handle.x = dragX;
            this.volumeBar.width = dragX;
            const newVolume = dragX / width;
            this.soundManager.setVolume(newVolume);
            this.updateVolumeText(newVolume);
        });

        // 볼륨 텍스트 생성
        this.volumeText = this.add.text(width + 20, 0, "100%", {
            fontSize: "16px",
            color: "#ffffff",
        });
        this.volumeText.setOrigin(0, 0.5);

        // 음소거 버튼 생성
        this.muteButton = this.add.text(
            width + 70,
            0,
            this.soundManager.isMuted ? "🔇" : "🔊",
            { fontSize: "20px" }
        );
        this.muteButton.setOrigin(0, 0.5);
        this.muteButton.setInteractive({ useHandCursor: true });

        this.muteButton.on("pointerdown", () => {
            this.soundManager.toggleMute();
            this.muteButton.setText(this.soundManager.isMuted ? "🔇" : "🔊");
            this.updateVolumeDisplay();
        });

        // 모든 요소를 컨테이너에 추가
        this.volumeControl = this.add.container(x, y, [
            background,
            this.volumeBar,
            this.handle,
            this.volumeText,
            this.muteButton,
        ]);
        this.volumeControl.setDepth(1000);

        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        const volume = this.soundManager.isMuted ? 0 : this.soundManager.volume;
        this.volumeBar.width = 150 * volume;
        this.handle.x = 150 * volume;
        this.updateVolumeText(volume);
    }

    updateVolumeText(volume) {
        this.volumeText.setText(`${Math.round(volume * 100)}%`);
    }
}

export class SoundManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.volume = 1;
        this.currentScene = null;
    }

    setScene(scene) {
        if (this.currentScene !== scene) {
            this.currentScene = scene;
            this.createVolumeControl();
        }
    }

    addSound(key, config = {}) {
        if (!this.currentScene) {
            console.error("No current scene set for SoundManager");
            return;
        }
        this.sounds[key] = this.currentScene.sound.add(key, {
            loop: config.loop || false,
            volume: this.volume * (config.volume || 1),
        });
        return this.sounds[key];
    }

    playSound(key) {
        if (this.sounds[key] && !this.isMuted) {
            this.sounds[key].play({ volume: this.volume });
        }
    }

    setVolume(volume) {
        this.volume = volume;
        Object.values(this.sounds).forEach((sound) => {
            sound.setVolume(this.volume);
        });
    }

    stopSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].stop();
        }
    }

    stopAllSounds() {
        Object.values(this.sounds).forEach((sound) => sound.stop());
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        Object.values(this.sounds).forEach((sound) => {
            sound.setMute(this.isMuted);
        });
    }

    createVolumeControl() {
        const width = 150;
        const height = 15;
        const x = 10;
        const y = this.currentScene.scale.height - 30;

        // 배경 생성 (클릭 가능한 영역)
        this.sliderBackground = this.currentScene.add.rectangle(
            0,
            0,
            width,
            height,
            0x333333
        );
        this.sliderBackground.setOrigin(0, 0.5);
        this.sliderBackground.setInteractive(
            new Phaser.Geom.Rectangle(0, -height / 2, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        this.addPointerEffect(this.sliderBackground);

        // 볼륨 레벨을 나타내는 막대 생성
        this.volumeBar = this.currentScene.add.rectangle(
            0,
            0,
            width * this.volume,
            height,
            0xea8015
        );
        this.volumeBar.setOrigin(0, 0.5);

        // 슬라이더 핸들 생성
        this.handle = this.currentScene.add.circle(
            width * this.volume,
            0,
            height / 2 + 5,
            0xffffff
        );
        this.handle.setInteractive({ draggable: true });
        this.addPointerEffect(this.handle);

        // 배경 클릭 이벤트 처리
        this.sliderBackground.on("pointerdown", this.onSliderClick, this);

        // 드래그 이벤트 처리
        this.handle.on("drag", (pointer, dragX) => {
            this.updateVolumeFromPosition(dragX);
        });

        // 볼륨 텍스트 생성
        this.volumeText = this.currentScene.add.text(width + 20, 0, "100%", {
            fontSize: "16px",
            color: "#ffffff",
        });
        this.volumeText.setOrigin(0, 0.5);

        // 음소거 버튼 생성
        this.muteButton = this.currentScene.add.text(
            width + 70,
            0,
            this.isMuted ? "🔇" : "🔊",
            { fontSize: "20px" }
        );
        this.muteButton.setOrigin(0, 0.5);
        this.muteButton.setInteractive({ useHandCursor: true });

        this.muteButton.on("pointerdown", () => {
            this.toggleMute();
            this.muteButton.setText(this.isMuted ? "🔇" : "🔊");
            this.updateVolumeDisplay();
        });

        // 모든 요소를 컨테이너에 추가
        this.volumeControl = this.currentScene.add.container(x, y, [
            this.sliderBackground,
            this.volumeBar,
            this.handle,
            this.volumeText,
            this.muteButton,
        ]);
        this.volumeControl.setDepth(1000);

        this.updateVolumeDisplay();
    }

    onSliderClick(pointer) {
        console.log("pointer", pointer);
        const localX =
            pointer.x - this.volumeControl.x - this.sliderBackground.x;
        this.updateVolumeFromPosition(localX);
    }

    updateVolumeFromPosition(position) {
        const width = 150;
        position = Phaser.Math.Clamp(position, 0, width);
        this.handle.x = position;
        this.volumeBar.width = position;
        const newVolume = position / width;
        this.setVolume(newVolume);
        this.updateVolumeText(newVolume);
    }

    updateVolumeDisplay() {
        const volume = this.isMuted ? 0 : this.volume;
        this.volumeBar.width = 150 * volume;
        this.handle.x = 150 * volume;
        this.updateVolumeText(volume);
    }

    updateVolumeText(volume) {
        this.volumeText.setText(`${Math.round(volume * 100)}%`);
    }

    addPointerEffect(gameObject) {
        gameObject.on("pointerover", () => {
            this.currentScene.input.setDefaultCursor("pointer");
        });

        gameObject.on("pointerout", () => {
            this.currentScene.input.setDefaultCursor("default");
        });
    }
}

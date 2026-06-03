export class SoundManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.volume = 1;
        this.currentScene = null;
        this.currentBGM = null;
        this.originalVolumes = {}; // 각 사운드의 원래 볼륨을 저장
    }

    setScene(scene) {
        this.currentScene = scene;
        this.createVolumeControl();
    }

    addSound(key, config = {}) {
        if (!this.currentScene) {
            console.error("No current scene set for SoundManager");
            return;
        }
        const originalVolume = config.volume || 1;
        this.sounds[key] = this.currentScene.sound.add(key, config);
        this.originalVolumes[key] = originalVolume;
        return this.sounds[key];
    }

    playSound(key, config = {}) {
        if (!this.sounds[key]) {
            this.addSound(key, config);
        }
        if (this.sounds[key]) {
            const originalVolume = this.originalVolumes[key];
            this.sounds[key].play({
                ...config,
                volume: originalVolume * this.volume,
            });
            this.sounds[key].setMute(this.isMuted);
        }
    }

    fadeOut(key, duration = 1000) {
        if (this.sounds[key]) {
            this.currentScene.tweens.add({
                targets: this.sounds[key],
                volume: 0,
                duration: duration,
                onComplete: () => {
                    this.stopSound(key);
                },
            });
        }
    }

    changeBGM(newBGMKey, fadeOutDuration = 1000) {
        if (this.currentBGM) {
            this.fadeOut(this.currentBGM, fadeOutDuration);
        }
        this.currentBGM = newBGMKey;
        this.playSound(newBGMKey, { loop: true, volume: 0.3 });
    }

    setVolume(volume) {
        this.volume = volume;
        Object.keys(this.sounds).forEach((key) => {
            const originalVolume = this.originalVolumes[key];
            this.sounds[key].setVolume(originalVolume * this.volume);
        });
    }

    stopCurrentBGM() {
        this.stopSound(this.currentBGM);
        this.currentBGM = null;
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
        this.muteButton.setText(this.isMuted ? "🔇" : "🔊");
    }

    createVolumeControl() {
        const width = 90;
        const height = 9;
        const x = 10;
        const y = this.currentScene.scale.height - 16;

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
            height / 2 + 3,
            0xffffff
        );
        this.handle.setInteractive({ draggable: true });
        this.addPointerEffect(this.handle);

        // 볼륨 조절 로직 수정
        this.sliderBackground.on("pointerdown", this.onSliderClick, this);

        this.handle.on("drag", (pointer, dragX) => {
            this.updateVolumeFromPosition(dragX);
        });

        // 볼륨 텍스트 생성
        this.volumeText = this.currentScene.add.text(width + 8, 0, "100%", {
            fontSize: "8px",
            color: "#ffffff",
        });
        this.volumeText.setOrigin(0, 0.5);

        // 음소거 버튼 생성
        this.muteButton = this.currentScene.add.text(
            width + 30,
            0,
            this.isMuted ? "🔇" : "🔊",
            { fontSize: "10px" }
        );
        this.muteButton.setOrigin(0, 0.5);
        this.muteButton.setInteractive({ useHandCursor: true });

        this.muteButton.on("pointerdown", () => {
            this.toggleMute();
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
        const localX =
            pointer.x - this.volumeControl.x - this.sliderBackground.x;
        this.updateVolumeFromPosition(localX);
    }

    updateVolumeFromPosition(position) {
        const width = 90;
        position = Phaser.Math.Clamp(position, 0, width);
        this.handle.x = position;
        this.volumeBar.width = position;
        const newVolume = position / width;
        this.setVolume(newVolume);
        this.updateVolumeText(newVolume);
        if (newVolume <= 0 && this.isMuted === false) {
            this.toggleMute();
        } else if (newVolume > 0 && this.isMuted === true) {
            this.toggleMute();
        }
    }

    updateVolumeDisplay() {
        const volume = this.isMuted ? 0 : this.volume;
        this.volumeBar.width = 90 * volume;
        this.handle.x = 90 * volume;
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


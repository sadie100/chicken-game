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
            this.sounds[key].play();
        }
    }

    stopSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].stop();
        }
    }

    stopAllSounds() {
        Object.values(this.sounds).forEach((sound) => sound.stop());
    }

    setVolume(volume) {
        this.volume = volume;
        Object.values(this.sounds).forEach((sound) => {
            sound.setVolume(this.volume);
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        Object.values(this.sounds).forEach((sound) => {
            sound.setMute(this.isMuted);
        });
    }

    createVolumeControl() {
        if (!this.currentScene) return;

        if (this.volumeControl) {
            this.volumeControl.destroy();
        }

        const width = 200;
        const height = 20;
        const x = this.currentScene.scale.width - width - 10;
        const y = 40;

        // Create background for slider
        const background = this.currentScene.add.rectangle(
            0,
            0,
            width,
            height,
            0x000000,
            0.5
        );
        background.setOrigin(0, 0.5);

        // Create slider
        const slider = this.currentScene.add.rectangle(
            0,
            0,
            width,
            height,
            0xffffff
        );
        slider.setOrigin(0, 0.5);

        // Create handle
        const handle = this.currentScene.add.circle(
            width,
            0,
            height / 2,
            0xffffff
        );

        // Make handle interactive
        handle.setInteractive({ draggable: true });

        // Update volume on drag
        handle.on("drag", (pointer, dragX) => {
            dragX = Phaser.Math.Clamp(dragX, 0, width);
            handle.x = dragX;
            slider.width = dragX;
            this.setVolume(dragX / width);
        });

        // Create mute button
        const muteButton = this.currentScene.add.text(-50, 0, "🔊", {
            fontSize: "24px",
        });
        muteButton.setOrigin(0.5);
        muteButton.setInteractive({ useHandCursor: true });

        muteButton.on("pointerdown", () => {
            this.toggleMute();
            muteButton.setText(this.isMuted ? "🔇" : "🔊");
        });

        // Add all elements to a container for easy management
        this.volumeControl = this.currentScene.add.container(x, y, [
            background,
            slider,
            handle,
            muteButton,
        ]);
        this.volumeControl.setDepth(1000); // Ensure it's on top of other game elements

        // Listen for scene resize events
        this.currentScene.scale.on("resize", this.updateUIPosition, this);
    }

    updateUIPosition() {
        if (this.volumeControl && this.currentScene) {
            const width = 200;
            const x = this.currentScene.scale.width - width - 10;
            const y = 40;
            this.volumeControl.setPosition(x, y);
        }
    }
}

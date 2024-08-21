export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("farm_background", "farm_background.png");
        this.load.image("life", "life.png");

        // Load chicken sprites
        this.load.spritesheet("chicken_idle", "chicken_idle.png", {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet("chicken_walk", "chicken_walk.png", {
            frameWidth: 48,
            frameHeight: 48,
        });

        this.load.image("egg", "egg.png");

        // Load pig sprite
        this.load.spritesheet("pig", "pig.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        // Load cat sprite
        this.load.spritesheet("cat", "cat.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        // Load fonts (if you're using them)
        this.load.bitmapFont(
            "pixelfont",
            "fonts/pixelfont.png",
            "fonts/pixelfont.xml"
        );
        this.load.image("knighthawks", "fonts/knight3.png");

        // Event to update the loading bar
        this.load.on("progress", (progress) => {
            console.log("Loading: " + Math.round(progress * 100) + "%");
        });
    }

    create() {
        this.createAnimations();
        this.scene.start("MainScene");
    }

    createAnimations() {
        // Chicken animations
        this.anims.create({
            key: "chicken_idle",
            frames: this.anims.generateFrameNumbers("chicken_idle", {
                start: 0,
                end: 1,
            }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: "chicken_walk",
            frames: this.anims.generateFrameNumbers("chicken_walk", {
                start: 0,
                end: 3,
            }),
            frameRate: 6,
            repeat: -1,
        });
        // Pig animations
        this.anims.create({
            key: "pig_idle",
            frames: this.anims.generateFrameNumbers("pig", {
                start: 0,
                end: 4,
            }),
            frameRate: 6,
            repeat: -1,
        });
        this.anims.create({
            key: "pig_walk",
            frames: this.anims.generateFrameNumbers("pig", {
                start: 5,
                end: 8,
            }),
            frameRate: 8,
            repeat: -1,
        });

        // Cat animations
        this.anims.create({
            key: "cat_idle",
            frames: this.anims.generateFrameNumbers("cat", {
                start: 0,
                end: 4,
            }),
            frameRate: 6,
            repeat: -1,
        });
        this.anims.create({
            key: "cat_walk",
            frames: this.anims.generateFrameNumbers("cat", {
                start: 5,
                end: 8,
            }),
            frameRate: 8,
            repeat: -1,
        });
    }
}


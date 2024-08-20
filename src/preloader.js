export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("farm_background", "farm_background.png");
        this.load.image("farm_floor", "farm_floor.png");

        // Load spritesheets
        this.load.spritesheet("duck", "duck.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet("mallard", "mallard.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet("chicken_idle", "chicken_idle.png", {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet("chicken_walk", "chicken_walk.png", {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet("monster", "monster.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.image("egg", "egg.png");

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
        // Create animations
        this.createAnimations();

        // Create bitmap font and load it in cache
        const config = {
            image: "knighthawks",
            width: 31,
            height: 25,
            chars: Phaser.GameObjects.RetroFont.TEXT_SET6,
            charsPerRow: 10,
            spacing: { x: 1, y: 1 },
        };
        this.cache.bitmapFont.add(
            "knighthawks",
            Phaser.GameObjects.RetroFont.Parse(this, config)
        );

        // When all the assets are loaded go to the next scene
        this.scene.start("MainScene"); // Changed from SplashScene to MainScene for direct testing
        console.log("Starting MainScene");
    }

    createAnimations() {
        // Duck animations
        this.anims.create({
            key: "duck_idle_normal",
            frames: this.anims.generateFrameNumbers("duck", {
                start: 0,
                end: 1,
            }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: "duck_walk_normal",
            frames: this.anims.generateFrameNumbers("duck", {
                start: 2,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "duck_idle_bounce",
            frames: this.anims.generateFrameNumbers("duck", {
                start: 8,
                end: 11,
            }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: "duck_walk_bounce",
            frames: this.anims.generateFrameNumbers("duck", {
                start: 12,
                end: 17,
            }),
            frameRate: 10,
            repeat: -1,
        });

        // Mallard animations (same as duck, but with 'mallard' key)
        this.anims.create({
            key: "mallard_idle_normal",
            frames: this.anims.generateFrameNumbers("mallard", {
                start: 0,
                end: 1,
            }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: "mallard_walk_normal",
            frames: this.anims.generateFrameNumbers("mallard", {
                start: 2,
                end: 7,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "mallard_idle_bounce",
            frames: this.anims.generateFrameNumbers("mallard", {
                start: 8,
                end: 11,
            }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: "mallard_walk_bounce",
            frames: this.anims.generateFrameNumbers("mallard", {
                start: 12,
                end: 17,
            }),
            frameRate: 10,
            repeat: -1,
        });

        // Chicken animations
        this.anims.create({
            key: "chicken_idle",
            frames: this.anims.generateFrameNumbers("chicken_idle", {
                start: 0,
                end: 1,
            }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: "chicken_walk",
            frames: this.anims.generateFrameNumbers("chicken_walk", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });

        // Monster (pig) animations
        this.anims.create({
            key: "monster_idle",
            frames: this.anims.generateFrameNumbers("monster", {
                start: 0,
                end: 4,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "monster_walk",
            frames: this.anims.generateFrameNumbers("monster", {
                start: 5,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });
    }
}


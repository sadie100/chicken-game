export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("farm_background", "farm_background.png");
        this.load.image("farm_floor", "farm_floor.png");

        // 스프라이트 시트 로드 설정 수정
        this.load.spritesheet("duck", "duck.png", {
            frameWidth: 32,
            frameHeight: 32,
            endFrame: 17,
        });
        this.load.spritesheet("mallard", "mallard.png", {
            frameWidth: 32,
            frameHeight: 32,
            endFrame: 17,
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
        this.createCharacterAnimations("duck");

        // Mallard animations
        this.createCharacterAnimations("mallard");

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

    createCharacterAnimations(character) {
        this.anims.create({
            key: `${character}_idle_normal`,
            frames: this.anims.generateFrameNumbers(character, {
                frames: [0, 1],
            }),
            frameRate: 2,
            repeat: -1,
        });
        this.anims.create({
            key: `${character}_walk_normal`,
            frames: this.anims.generateFrameNumbers(character, {
                frames: [2, 3, 4, 5, 6, 7],
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: `${character}_idle_bounce`,
            frames: this.anims.generateFrameNumbers(character, {
                frames: [8, 9, 10, 11],
            }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: `${character}_walk_bounce`,
            frames: this.anims.generateFrameNumbers(character, {
                frames: [12, 13, 14, 15, 16, 17],
            }),
            frameRate: 10,
            repeat: -1,
        });
    }
}


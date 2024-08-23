export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.load.setPath("assets");
        // 배경 에셋 로드
        this.loadBackgroundAssets();
        this.load.image("life", "life.png");
        this.load.image("next-arrow", "next-arrow.png");
        this.load.image("enemy-bullet", "monsters/enemy-bullet.png");

        // Load chicken sprites
        this.load.spritesheet("chicken_idle", "/player/chicken_idle.png", {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet("chicken_walk", "/player/chicken_walk.png", {
            frameWidth: 48,
            frameHeight: 48,
        });

        this.load.image("egg", "/player/egg.png");

        // Load pig sprite
        this.load.spritesheet("pig", "/monsters/pig.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        // Load pig sprite
        this.load.spritesheet("gold_pig", "/monsters/gold-pig.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        // Load cat sprite
        this.load.spritesheet("cat", "/monsters/cat.png", {
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

        // 아이템 이미지 로드
        this.load.spritesheet("itemList1", "items/items1.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.spritesheet("itemList2", "items/items2.png", {
            frameWidth: 16,
            frameHeight: 16,
        });

        //보스 헬스 바
        this.load.image("health_bar_fill", "monsters/health_bar_fill.png");
        this.load.image("health_bar_border", "monsters/health_bar_border.png");
    }

    create() {
        this.createAnimations();
        this.add.image(16, 16, "itemList1", 0);
        this.add.image(32, 16, "itemList1", 1);
        this.add.image(48, 16, "itemList1", 2);
        this.add.image(64, 16, "itemList1", 3);
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
        this.scene.start("MenuScene");
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
        // Pig animations
        this.anims.create({
            key: "gold_pig_idle",
            frames: this.anims.generateFrameNumbers("gold_pig", {
                start: 0,
                end: 4,
            }),
            frameRate: 6,
            repeat: -1,
        });
        this.anims.create({
            key: "gold_pig_walk",
            frames: this.anims.generateFrameNumbers("gold_pig", {
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

    loadBackgroundAssets() {
        // 모든 배경 에셋 로드
        for (let i = 1; i <= 5; i++) {
            // 5개의 배경 세트가 있다고 가정
            for (let j = 1; j <= 4; j++) {
                // 각 배경 세트는 4개의 레이어
                this.load.image(
                    `background${i}_${j}`,
                    `backgrounds/background${i}/${j}.png`
                );
            }
        }
    }
}


import { SoundManager } from "./gameobjects/SoundManager";

export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.displayLoadingBar();

        this.load.setPath("assets");
        // 배경 에셋 로드
        this.loadBackgroundAssets();
        this.loadIllustrations();
        this.load.image("life", "life.png");
        this.load.image("next-arrow", "next-arrow.png");
        this.load.image("enemy-bullet", "monsters/enemy-bullet.png");
        this.load.image("close", "close.svg");

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
        this.load.spritesheet("itemList3", "items/items3.png", {
            frameWidth: 16,
            frameHeight: 16,
        });

        //보스 헬스 바
        this.load.image("health_bar_fill", "monsters/health_bar_fill.png");
        this.load.image("health_bar_border", "monsters/health_bar_border.png");

        //효과음, bgm
        this.load.audio("bgm1", "sounds/bgm1.mp3");
        this.load.audio("bgm2", "sounds/bgm2.mp3");
        this.load.audio("bgm3", "sounds/bgm3.mp3");
        this.load.audio("gameclear", "sounds/gameclear.mp3");
        this.load.audio("stageclear", "sounds/stageclear.wav");
        this.load.audio("eggSound", "sounds/egg.mp3");
        this.load.audio("hitSound", "sounds/hit.wav");
        this.load.audio("gameover", "sounds/gameover.wav");
    }

    create() {
        this.createAnimations();

        // Initialize SoundManager
        this.game.sound.mute = false; // Ensure sound is not muted by default
        this.soundManager = new SoundManager(this);
        this.game.registry.set("soundManager", this.soundManager);

        // 메뉴 씬 시작 전, 배경 씬은 유지하여 Menu에서도 같은 배경을 사용
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

    loadIllustrations() {
        this.load.image("ending", "illusts/ending.jpg");
        this.load.image("gameover", "illusts/gameover.png");
        this.load.image("main", "illusts/main.jpg");
        this.load.image("prologue", "illusts/prologue.jpg");
        this.load.image("menu", "illusts/menu.png");
    }

    displayLoadingBar() {
        // 배경 씬 실행 (이미 실행 중이면 무시)
        const isBgActive =
            this.scene.isActive && this.scene.isActive("BackgroundScene");
        if (!isBgActive) {
            this.scene.launch("BackgroundScene");
            this.scene.sendToBack("BackgroundScene");
        }

        /*** Wood/Farm Pixel Themed Loading Bar ***/
        const camera = this.cameras.main;
        const barX = camera.width / 4;
        const barY = camera.height / 2.5;
        const barW = camera.width / 2;
        const barH = camera.height / 20;

        const border = this.add.graphics();
        const fill = this.add.graphics();

        // Title
        const loadingText = this.add.text(
            camera.width / 2,
            camera.height / 3,
            "Heading to the Chicken World...",
            {
                fontFamily: "Impact",
                fontSize: "48px",
                color: "#ffffff",
            }
        );
        loadingText.setOrigin(0.5, 0.5);

        // Percentage
        const percentText = this.add.text(
            camera.width / 2,
            camera.height / 2,
            "0%",
            {
                fontFamily: "Impact",
                fontSize: "48px",
                color: "#ffffff",
            }
        );
        percentText.setOrigin(0.5, 0.5);

        // Static wooden border
        border.lineStyle(6, 0x4b2e16, 1);
        border.fillStyle(0x2a1a0f, 0.6); // dark shadow under bar
        border.fillRect(barX - 4, barY + barH + 6, barW + 8, 8);
        border.fillStyle(0x8b5a2b, 1); // base wood background
        border.fillRect(barX, barY, barW, barH);
        border.lineStyle(6, 0x2a1a0f, 1);
        border.strokeRect(barX, barY, barW, barH);

        // Plank separators for pixel feel
        const plankWidth = 24;
        const plankLines = this.add.graphics();
        plankLines.lineStyle(2, 0x6d3f1f, 0.7);
        for (let px = barX + plankWidth; px < barX + barW; px += plankWidth) {
            plankLines.beginPath();
            plankLines.moveTo(px, barY + 3);
            plankLines.lineTo(px, barY + barH - 3);
            plankLines.strokePath();
        }

        // Chicken icon that moves along the bar
        let chickenIcon = null;
        const updateChicken = (progress) => {
            if (
                !this.textures.exists("chicken_walk") &&
                !this.textures.exists("chicken_idle")
            ) {
                return;
            }
            if (!chickenIcon) {
                const key = this.textures.exists("chicken_walk")
                    ? "chicken_walk"
                    : "chicken_idle";
                chickenIcon = this.add.sprite(barX, barY + barH / 2, key, 0);
                chickenIcon.setScale(1.5);
                chickenIcon.setOrigin(0.5, 0.5);
            }
            const clamped = Phaser.Math.Clamp(progress, 0, 1);
            const posX = barX + clamped * barW;
            chickenIcon.x = posX;
            chickenIcon.y = barY + barH / 2 - 6;
        };

        // Update fill by progress
        this.load.on("progress", (value) => {
            percentText.setText(`${Math.ceil(value * 100)}%`);
            fill.clear();
            fill.fillStyle(0xc69c6d, 1); // lighter wood fill
            const innerPad = 4;
            const width = Math.max(0, value * (barW - innerPad * 2));
            fill.fillRect(
                barX + innerPad,
                barY + innerPad,
                width,
                barH - innerPad * 2
            );
            updateChicken(value);
        });

        this.load.on("complete", () => {
            // small finish move
            if (chickenIcon) {
                this.tweens.add({
                    targets: chickenIcon,
                    y: chickenIcon.y - 6,
                    duration: 200,
                    yoyo: true,
                    repeat: 1,
                    ease: "Sine.easeInOut",
                });
            }
            // clean up UI after a short delay (so finish animation is visible)
            this.time.delayedCall(150, () => {
                border.destroy();
                fill.destroy();
                plankLines.destroy();
                loadingText.destroy();
                percentText.destroy();
                if (chickenIcon) chickenIcon.destroy();
            });
        });
    }
}


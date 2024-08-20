export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("logo", "logo.png");
        this.load.image("farm_background", "farm_background.png");

        // Load character images
        this.load.image("duck", "duck.png");
        this.load.image("mallard", "mallard.png");
        this.load.image("chicken", "chicken.png");

        // Load egg image
        this.load.image("egg", "egg.png");

        // Load cat image
        this.load.image("cat", "cat.png");

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
        // ... rest of the code remains the same ...
    }
}


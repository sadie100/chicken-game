import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Cat } from "../gameobjects/Cat";

export class MainScene extends Scene {
    player = null;
    cats = null;
    cursors = null;
    points = 0;

    constructor() {
        super("MainScene");
    }

    create() {
        this.add.image(0, 0, "farm_background").setOrigin(0, 0);

        // Player
        this.player = new Player({ scene: this });

        // Cats group
        this.cats = this.physics.add.group({
            classType: Cat,
            runChildUpdate: true,
        });

        // Spawn cats
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnCat,
            callbackScope: this,
            loop: true,
        });

        // Cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-SPACE", () => {
            this.player.fire();
        });

        // Collision detection
        this.physics.add.overlap(
            this.player.eggs,
            this.cats,
            this.hitCat,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.cats,
            this.gameOver,
            null,
            this
        );
    }

    spawnCat() {
        const x = this.scale.width;
        const y = Phaser.Math.Between(50, this.scale.height - 50);
        const cat = new Cat(this, x, y);
        this.cats.add(cat);
    }

    hitCat(egg, cat) {
        egg.setActive(false);
        egg.setVisible(false);

        if (egg.characterType === "chicken") {
            cat.stun();
        }

        cat.hit(egg.damage);
        this.points += 10;
        // Update score display
    }

    gameOver() {
        this.scene.start("GameOverScene", { points: this.points });
    }

    update() {
        this.player.update();

        if (this.cursors.up.isDown) {
            this.player.move("up");
        }
        if (this.cursors.down.isDown) {
            this.player.move("down");
        }
    }
}


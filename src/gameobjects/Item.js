import { Scene } from "phaser";

export class Item extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, id) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.id = id;
        this.setScale(3);
        this.setInteractive();

        this.originalX = x;
        this.originalY = y;

        this.description = "Item description goes here"; // Set this for each item
        this.descriptionText = scene.add.text(
            x,
            y + this.height + 10,
            this.description,
            {
                backgroundColor: "#000000",
                padding: { x: 5, y: 5 },
                fontSize: "14px",
            }
        );
        this.descriptionText.setOrigin(0.5, 0);
        this.descriptionText.setDepth(1000); // Set high depth to ensure it's on top
    }

    collect() {
        this.setVisible(false);
        this.body.enable = false;
    }

    return() {
        this.setPosition(this.originalX, this.originalY);
        this.setVisible(true);
        this.body.enable = true;
    }
}

export class ItemManager {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
    }

    addItem(x, y, texture, frame, id) {
        const item = new Item(this.scene, x, y, texture, frame, id);
        this.items.push(item);
        return item;
    }
}

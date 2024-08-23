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

        this.effect = this.getEffect(id);
        this.removeEffect = this.getRemoveEffect(id);
        this.description = this.getDescription(id);
        this.descriptionText = scene.add.text(
            x,
            y + this.height + 10,
            this.description,
            {
                backgroundColor: "#000000",
                padding: { x: 5, y: 5 },
                fontSize: "16px",
            }
        );
        this.descriptionText.setOrigin(0.5, 0);
        this.descriptionText.setDepth(1000);
    }

    getEffect(id) {
        switch (id) {
            case "item1":
                return (player) => {
                    player.increaseBulletDamage(1);
                };
            case "item2":
                return (player) => {
                    player.increaseBulletSpeed(100);
                };
            default:
                return () => {};
        }
    }

    getRemoveEffect(id) {
        switch (id) {
            case "item1":
                return (player) => {
                    player.decreaseBulletDamage(1);
                };
            case "item2":
                return (player) => {
                    player.decreaseBulletSpeed(100);
                };
            default:
                return () => {};
        }
    }

    getDescription(id) {
        switch (id) {
            case "item1":
                return "Increases bullet damage by 1";
            case "item2":
                return "Increases bullet speed by 100";
            default:
                return "Unknown item";
        }
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

    applyEffect(player) {
        this.effect(player);
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


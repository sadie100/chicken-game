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
        // 텍스트 스타일 수정
        const textStyle = {
            fontSize: "16px",
            backgroundColor: "#000000",
            padding: { x: 5, y: 5 },
            align: "center",
            wordWrap: { width: 150, useAdvancedWrap: true },
        };

        // 텍스트 생성 및 설정 수정
        this.descriptionText = scene.add.text(
            x,
            y + this.height + 10,
            this.description,
            textStyle
        );
        this.descriptionText.setOrigin(0.5, 0);
        this.descriptionText.setDepth(1000);
    }

    getEffect(id) {
        switch (id) {
            case "BulletBooster":
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
            case "BulletBooster":
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
            case "BulletBooster":
                return "달걀 데미지를 강화합니다.";
            case "item2":
                return "Increases bullet speed by 100";
            case "item3":
                return "Grants temporary invincibility";
            case "item4":
                return "Restores 1 life point";
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

    hideDescription() {
        if (this.descriptionText) {
            this.descriptionText.setVisible(false);
        }
    }

    showDescription() {
        if (this.descriptionText) {
            this.descriptionText.setVisible(true);
        }
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

    hideAllDescriptions() {
        this.items.forEach((item) => item.hideDescription());
    }

    showAllDescriptions() {
        this.items.forEach((item) => item.showDescription());
    }
}


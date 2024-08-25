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
            case "EggSpeedBooster":
                return (player) => {
                    player.increaseBulletSpeed(100);
                };
            case "SpeedBooster":
                return (player) => {
                    player.increaseSpeed(100);
                };
            case "EggSizeBooster":
                return (player) => {
                    player.increaseEggSize();
                };
            case "StunAbility":
                return (player) => {
                    player.enableStun();
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
            case "EggSpeedBooster":
                return (player) => {
                    player.decreaseBulletSpeed(100);
                };
            case "SpeedBooster":
                return (player) => {
                    player.decreaseSpeed(100);
                };
            case "EggSizeBooster":
                return (player) => {
                    player.decreaseEggSize();
                };
            case "StunAbility":
                return (player) => {
                    player.canStun = false;
                };
            default:
                return () => {};
        }
    }

    getDescription(id) {
        switch (id) {
            case "BulletBooster":
                return "달걀 데미지를 강화합니다.";
            case "EggSpeedBooster":
                return "달걀의 이동속도가 빨라집니다.";
            case "SpeedBooster":
                return "이동속도가 빨라집니다.";
            case "EggSizeBooster":
                return "달걀 크기가 커집니다.";
            case "StunAbility":
                return "알에 맞은 몬스터를 잠시 기절시키는 능력을 얻습니다. 보스 몬스터에는 통하지 않습니다.";
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

    createItemById(id, scene) {
        // scene 매개변수를 사용하도록 수정
        const itemConfig = this.getItemConfigById(id);
        if (itemConfig) {
            return new Item(
                scene,
                0,
                0,
                itemConfig.texture,
                itemConfig.frame,
                id
            );
        }
        return null;
    }

    getItemConfigById(id) {
        // 이 메서드는 아이템 ID에 해당하는 설정을 반환합니다.
        // 실제 구현은 게임의 아이템 시스템에 따라 달라질 수 있습니다.
        const itemConfigs = {
            BulletBooster: { texture: "itemList1", frame: 0 },
            EggSpeedBooster: { texture: "itemList1", frame: 1 },
            SpeedBooster: { texture: "itemList1", frame: 2 },
            EggSizeBooster: { texture: "itemList1", frame: 3 },
            // 다른 아이템들...
        };
        return itemConfigs[id];
    }
}


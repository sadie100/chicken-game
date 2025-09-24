import { Scene } from "phaser";
import { ITEM_DEFS } from "../config/items";

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

        const def = ITEM_DEFS[id];
        if (def) {
            this.effect = def.apply;
            this.removeEffect = def.remove;
            this.description = def.description;
        } else {
            this.effect = () => {};
            this.removeEffect = () => {};
            this.description = "Unknown item";
        }
        // 아이템 설명 텍스트는 생성하지 않음 (요청에 따라 비활성화)
        this.descriptionText = null;
    }

    // 효과/제거/설명은 ITEM_DEFS에서 주입됨

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

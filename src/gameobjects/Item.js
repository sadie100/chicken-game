import { ITEM_DEFS, ITEM_TIMING_DEFAULT } from "../config/items";

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

        // 수명/깜빡임 설정 및 시작
        const timing = (def && def.timing) || ITEM_TIMING_DEFAULT;
        this.initLifetime(timing);
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

    initLifetime(timing) {
        const { lifetimeMs, blinkStartMs, blinkIntervalMs } = timing;
        this.blinkIntervalMs = blinkIntervalMs;

        this.blinkTimer = this.scene.time.delayedCall(
            blinkStartMs,
            () => this.startBlink(),
            null,
            this
        );

        this.despawnTimer = this.scene.time.delayedCall(
            lifetimeMs,
            () => this.despawn(),
            null,
            this
        );
    }

    startBlink() {
        if (this.blinkTween) return;
        this.blinkTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.2,
            duration: this.blinkIntervalMs,
            yoyo: true,
            repeat: -1,
        });
    }

    stopBlink() {
        if (this.blinkTween) {
            this.scene.tweens.killTweensOf(this);
            this.blinkTween = null;
        }
        this.setAlpha(1);
    }

    despawn() {
        this.stopBlink();
        this.body.enable = false;
        this.setVisible(false);
        this.destroy();
    }

    collect() {
        if (this.blinkTimer) this.blinkTimer.remove();
        if (this.despawnTimer) this.despawnTimer.remove();
        this.stopBlink();
        this.setVisible(false);
        this.body.enable = false;
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

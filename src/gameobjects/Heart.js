import { Physics } from "phaser";

export class Heart extends Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "life");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2.5); // 기존 스케일 유지
        this.setActive(false);
        this.setVisible(false);

        // 스프라이트를 더 밝게 만듭니다
        this.setTint(0xffffff); // 흰색 틴트를 추가하여 밝게 만듭니다
        this.preFX.addGlow(0xffffff, 4, 0, false, 0.1, 1);

        this.disappearTimer = null;
        this.blinkTimer = null;
    }

    spawn(x, y) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);

        // 8초 후 깜빡이기 시작
        this.blinkTimer = this.scene.time.delayedCall(8000, () => {
            this.startBlinking();
        });

        // 10초 후 사라짐
        this.disappearTimer = this.scene.time.delayedCall(10000, () => {
            this.despawn();
        });
    }

    startBlinking() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 200,
            ease: "Power2",
            yoyo: true,
            repeat: -1,
        });
    }

    despawn() {
        if (this.blinkTimer) this.blinkTimer.remove();
        if (this.disappearTimer) this.disappearTimer.remove();
        this.scene.tweens.killTweensOf(this);
        this.destroy();
    }
}


import { GameObjects, Math } from "phaser";

export class Egg extends GameObjects.Image {
    speed;
    characterType;
    damage;

    constructor(scene, x, y) {
        super(scene, x, y, "egg");
        this.setScale(0.5);
    }

    fire(x, y, characterType, damage, speed) {
        this.characterType = characterType;
        this.damage = damage;
        this.speed = Phaser.Math.GetSpeed(speed, 1);

        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);

        // Set egg tint based on character type
        switch (characterType) {
            case "duck":
                this.setTint(0xffff00); // Yellow
                break;
            case "mallard":
                this.setTint(0x00ff00); // Green
                break;
            case "chicken":
                this.setTint(0xffffff); // White
                break;
        }
    }

    update(time, delta) {
        this.x += this.speed * delta;

        if (this.x > this.scene.scale.width) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

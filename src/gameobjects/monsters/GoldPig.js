import { Monster } from "./Monster";

export class GoldPig extends Monster {
    constructor(scene, x, y, speed, direction) {
        super(scene, x, y, "gold_pig", speed, direction);
        this.health = 100; // Pig의 체력을 1로 설정
        this.setScale(50); // Pig의 크기를 3배로 확대

        if (this.scene.anims.exists("gold_pig_walk")) {
            this.play("gold_pig_walk");
        }
    }
}


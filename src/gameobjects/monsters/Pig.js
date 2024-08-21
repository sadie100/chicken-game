import { Monster } from "./Monster";

export class Pig extends Monster {
    constructor(scene, x, y, speed, direction) {
        super(scene, x, y, "pig", speed, direction);
        this.health = 1; // Pig의 체력을 1로 설정
        this.setScale(3); // Pig의 크기를 3배로 확대

        if (this.scene.anims.exists("pig_walk")) {
            this.play("pig_walk");
        }
    }
}


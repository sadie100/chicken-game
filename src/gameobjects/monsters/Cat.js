import { Monster } from "./Monster";

export class Cat extends Monster {
    constructor(scene, x, y, baseSpeed = 500) {
        // Cat의 속도를 기본 속도의 1.5배로 설정
        const catSpeed = baseSpeed * 1.5;
        super(scene, x, y, "cat", catSpeed);

        if (this.scene.anims.exists("cat_walk")) {
            this.play("cat_walk");
        }
    }
}


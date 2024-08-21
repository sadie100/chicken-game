import { Monster } from "./Monster";

export class Cat extends Monster {
    constructor(scene, x, y, speed, angle) {
        // Cat의 속도를 기본 속도의 1.5배로 설정
        const catSpeed = speed * 1.5;
        super(scene, x, y, "cat", catSpeed, angle);

        if (this.scene.anims.exists("cat_walk")) {
            this.play("cat_walk");
        }
    }
}


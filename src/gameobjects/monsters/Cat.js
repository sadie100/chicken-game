import { Monster } from "./Monster";

export class Cat extends Monster {
    constructor(scene, x, y, speed, direction) {
        // Cat의 속도를 기본 속도의 1.5배로 설정
        const catSpeed = speed * 1.5;
        super(scene, x, y, "cat", catSpeed, direction);

        if (this.scene.anims.exists("cat_walk")) {
            this.play("cat_walk");
        }
    }
}


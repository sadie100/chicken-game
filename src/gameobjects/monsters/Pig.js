import { Monster } from "./Monster";

export class Pig extends Monster {
    constructor(scene, x, y, speed = 150) {
        super(scene, x, y, "pig", speed);

        if (this.scene.anims.exists("pig_walk")) {
            this.play("pig_walk");
        }
    }
}

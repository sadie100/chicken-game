import { Physics } from "phaser";
import { Egg } from "./Egg";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    eggs = null;
    isMoving = false;

    constructor({ scene }) {
        super(scene, 200, scene.scale.height - 100, "chicken_idle");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setScale(2); // 크기를 2배로 키웁니다 (필요에 따라 조정)

        // Eggs group
        this.eggs = this.scene.physics.add.group({
            classType: Egg,
            maxSize: 100,
            runChildUpdate: true,
        });

        this.playIdleAnimation();
    }

    playIdleAnimation() {
        this.play("chicken_idle", true);
    }

    playWalkAnimation() {
        this.play("chicken_walk", true);
    }

    fire() {
        const egg = this.eggs.get();
        if (egg) {
            egg.fire(this.x, this.y, 400); // 400은 egg의 속도입니다. 필요에 따라 조정하세요.
            egg.body.onWorldBounds = true; // 월드 경계에 도달했을 때 이벤트를 활성화합니다.
            egg.body.world.on("worldbounds", (body) => {
                if (body.gameObject === egg) {
                    egg.destroy();
                }
            });
        }
    }

    move(direction) {
        let moved = false;
        if (direction === "up" && this.y - 10 > 0) {
            this.y -= 5;
            moved = true;
        } else if (
            direction === "down" &&
            this.y + 75 < this.scene.scale.height
        ) {
            this.y += 5;
            moved = true;
        }

        if (moved) {
            this.playWalkAnimation();
        } else {
            this.playIdleAnimation();
        }
    }

    update() {
        // Update logic if needed
    }
}


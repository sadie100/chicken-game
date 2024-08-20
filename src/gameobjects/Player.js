import { Physics } from "phaser";
import { Egg } from "./Egg";

export class Player extends Physics.Arcade.Sprite {
    scene = null;
    currentCharacter = 0;
    characters = ["duck", "mallard", "chicken"];
    eggs = null;
    isMoving = false;

    constructor({ scene }) {
        super(scene, 200, scene.scale.height - 100, "duck");
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setTexture(this.characters[this.currentCharacter]);
        this.playIdleAnimation();

        // Eggs group
        this.eggs = this.scene.physics.add.group({
            classType: Egg,
            maxSize: 100,
            runChildUpdate: true,
        });

        // Add key listener for character switch
        this.scene.input.keyboard.on("keydown-TAB", this.switchCharacter, this);
    }

    switchCharacter() {
        this.currentCharacter =
            (this.currentCharacter + 1) % this.characters.length;
        this.setTexture(this.characters[this.currentCharacter]);
        this.playIdleAnimation();
    }

    playIdleAnimation() {
        const character = this.characters[this.currentCharacter];
        if (character === "chicken") {
            this.play("chicken_idle", true);
        } else {
            this.play(`${character}_idle_normal`, true);
        }
    }

    playWalkAnimation() {
        const character = this.characters[this.currentCharacter];
        if (character === "chicken") {
            this.play("chicken_walk", true);
        } else {
            this.play(`${character}_walk_normal`, true);
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

    fire() {
        const egg = this.eggs.get();
        if (egg) {
            const character = this.characters[this.currentCharacter];
            switch (character) {
                case "duck":
                    egg.fire(this.x, this.y, "duck", 2, 300);
                    break;
                case "mallard":
                    egg.fire(this.x, this.y, "mallard", 0.5, 600);
                    break;
                case "chicken":
                    egg.fire(this.x, this.y, "chicken", 1, 400);
                    break;
            }
        }
    }

    update() {
        // Update logic
    }
}


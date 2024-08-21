import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Monster } from "../gameobjects/Monster";

export class MainScene extends Scene {
    player = null;
    monsters = null;
    cursors = null;
    points = 0;
    hudScene = null;

    constructor() {
        super("MainScene");
    }

    create() {
        this.add.image(0, 0, "farm_background").setOrigin(0, 0);

        // Player
        this.player = new Player({ scene: this });

        // Monsters group
        this.monsters = this.physics.add.group({
            classType: Monster,
            runChildUpdate: true,
        });

        // Spawn monsters
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnMonster,
            callbackScope: this,
            loop: true,
        });

        // Cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on("keydown-SPACE", () => {
            this.player.fire();
        });

        // Collision detection
        this.physics.add.overlap(
            this.player.eggs,
            this.monsters,
            this.hitMonster,
            null,
            this
        );
        this.physics.add.overlap(
            this.player,
            this.monsters,
            this.playerHitMonster,
            null,
            this
        );

        // HUD 씬 시작
        this.scene.launch("HudScene");
        this.hudScene = this.scene.get("HudScene");
    }

    spawnMonster() {
        const x = this.scale.width;
        const y = Phaser.Math.Between(50, this.scale.height - 50);
        const monster = new Monster(this, x, y);
        this.monsters.add(monster);
    }

    hitMonster(egg, monster) {
        console.log("Egg hit monster. Damage:", egg.damage);
        monster.hit(egg.damage);

        this.points += 10;
        this.hudScene.update_points(this.points);

        // Update score display

        egg.destroy(); // egg를 완전히 제거합니다.
    }

    gameOver() {
        console.log("Game Over called"); // 디버깅용 로그 추가
        this.scene.start("GameOverScene", { points: this.points });
    }

    playerHitMonster(player, monster) {
        monster.destroy();
        const remainingLives = player.loseLife();
        this.hudScene.updateLives(remainingLives);

        if (remainingLives <= 0) {
            this.gameOver();
        }
    }

    update() {
        this.player.update();

        if (this.cursors.up.isDown) {
            this.player.move("up");
        }
        if (this.cursors.down.isDown) {
            this.player.move("down");
        }
    }
}


import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Monster } from "../gameobjects/Monster";

export class MainScene extends Scene {
    player = null;
    monsters = null;
    cursors = null;
    points = 0;
    hudScene = null;
    spawnTimer = null;
    initialSpawnDelay = 2000;
    minSpawnDelay = 500;
    spawnReductionRate = 100;
    gameTime = 0;
    initialMonsterSpeed = 100;
    currentMonsterSpeed = 100;
    monsterSpeedIncreaseRate = 5; // 10초마다 증가할 속도

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

        // WASD keys for alternative movement
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

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

        // 적 스폰 타이머 설정
        this.spawnTimer = this.time.addEvent({
            delay: this.initialSpawnDelay,
            callback: this.spawnMonster,
            callbackScope: this,
            loop: true,
        });

        // 게임 시간 및 난이도 조절을 위한 타이머
        this.time.addEvent({
            delay: 1000, // 1초마다
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true,
        });
    }

    updateGameTime() {
        this.gameTime++;

        // 10초마다 스폰 주기 감소 및 몬스터 속도 증가
        if (this.gameTime % 10 === 0) {
            // 스폰 주기 감소
            let newDelay = this.spawnTimer.delay - this.spawnReductionRate;
            if (newDelay < this.minSpawnDelay) {
                newDelay = this.minSpawnDelay;
            }
            this.spawnTimer.delay = newDelay;

            // 몬스터 속도 증가
            this.currentMonsterSpeed += this.monsterSpeedIncreaseRate;

            console.log(
                `Spawn delay reduced to ${newDelay}ms, Monster speed increased to ${this.currentMonsterSpeed}`
            );
        }
    }

    spawnMonster() {
        const x = this.scale.width;
        const y = Phaser.Math.Between(50, this.scale.height - 50);
        const monster = new Monster(this, x, y, this.currentMonsterSpeed);
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

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.move("up");
        }
        if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.move("down");
        }
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.move("left");
        }
        if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.move("right");
        }

        if (
            !this.cursors.up.isDown &&
            !this.cursors.down.isDown &&
            !this.cursors.left.isDown &&
            !this.cursors.right.isDown &&
            !this.wasd.up.isDown &&
            !this.wasd.down.isDown &&
            !this.wasd.left.isDown &&
            !this.wasd.right.isDown
        ) {
            this.player.playIdleAnimation();
        }
    }
}


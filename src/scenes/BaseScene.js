import { Scene } from "phaser";
import { Player } from "../gameobjects/Player";
import { Monster } from "../gameobjects/monsters/Monster";
import { Heart } from "../gameobjects/Heart";
import { ItemManager } from "../gameobjects/Item";

export class BaseScene extends Scene {
    player = null;
    monsters = null;
    cursors = null;
    points = 0;
    hudScene = null;
    spawnTimer = null;
    gameTime = 0;
    background = null;
    itemManager = null;
    lives = 5;

    //라운드 종료
    elapsedSeconds = 0;
    isStageComplete = false;
    nextRoundArrow = null;

    constructor(key) {
        super(key);
    }

    init(data) {
        if (!data) {
            return;
        }
        this.player = data.player;
        if (this.player) {
            this.effects = data.player.getEffects();
        }
        this.points = data.points || 0;
        this.lives = data.lives || 5;

        if (data.heldItem) {
            this.player.heldItem = data.heldItem;
        }
        if (data.restart) {
            this.resetScene();
        }
    }

    resetScene() {
        // Reset necessary variables and game state
        this.points = 0;
        // Add any other reset logic specific to this scene
    }

    create() {
        // 대신, 즉시 불투명해지도록 설정
        this.cameras.main.alpha = 1;

        // 게임의 전반적인 밝기를 일정하게 유지
        this.cameras.main.setBackgroundColor("#1c172e"); // 기본 배경색 설정

        this.createBackground();

        // Player
        this.player = new Player({ scene: this });
        if (this.effects) {
            this.player.setEffects(this.effects);
        }

        this.player.setLives(this.lives);

        // Monsters group
        this.monsters = this.physics.add.group({
            classType: Monster,
            runChildUpdate: true,
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

        // 스페이스바 입력 처리 수정
        this.input.keyboard.on("keydown-SPACE", () => {
            this.player.setData("isFiring", true);
        });

        this.input.keyboard.on("keyup-SPACE", () => {
            this.player.setData("isFiring", false);
            this.player.fireTimer = 0;
        });
        // Collision detection
        this.setupCollisions();

        // HUD 씬 시작
        this.setupHUD();

        // Player의 초기 총알 정보 업데이트
        this.time.delayedCall(100, () => {
            this.player.updateHUD();
        });

        // Hearts group
        this.hearts = this.physics.add.group({
            classType: Heart,
            runChildUpdate: true,
        });

        // Collision detection for hearts
        this.physics.add.overlap(
            this.player,
            this.hearts,
            this.collectHeart,
            null,
            this
        );

        this.itemManager = new ItemManager(this);

        // 아이템과 플레이어 간의 충돌 설정
        this.physics.add.overlap(
            this.player,
            this.itemManager.items,
            this.collectItem,
            null,
            this
        );

        // 장면 전환을 위한 오버레이 생성
        this.transitionOverlay = this.add.rectangle(
            0,
            0,
            this.scale.width,
            this.scale.height,
            0x000000
        );
        this.transitionOverlay.setOrigin(0);
        this.transitionOverlay.setDepth(1000);
        this.transitionOverlay.alpha = 1; // 시작 시 완전히 불투명하게 설정

        this.events.on("wake", this.onSceneWake, this);

        // 배경 생성 후 전환 오버레이 페이드 아웃
        this.tweens.add({
            targets: this.transitionOverlay,
            alpha: 0,
            duration: 500,
            ease: "Power2",
        });
    }

    onSceneWake() {
        // Scene이 다시 활성화될 때 호출되는 메서드
        this.cameras.main.alpha = 1;
        this.cameras.main.setBackgroundColor("#1c172e");
    }

    completeStage() {
        //자식에서 오버라이드
    }

    update(time, delta) {
        this.handlePlayerMovement(delta);
        if (this.background) {
            this.background.update(delta);
        }

        this.player.updateCooldown(delta);

        // 자동 발사 처리
        if (this.player.getData("isFiring")) {
            this.player.fire();
        }
    }

    createBackground() {
        // 기본 배경 키 설정 (자식 클래스에서 오버라이드 가능)
        this.background = this.getBackground();
        this.background.create();
    }

    getBackground() {
        // (자식 클래스에서 오버라이드해야 함)
        throw new Error("getBackground must be implemented in child class");
    }

    setupCollisions() {
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
    }

    setupHUD() {
        this.hudScene = this.scene.get("HudScene");
        this.hudScene.updateLives(this.player.getLives());
        this.player.updateHUD(); // 아이템 효과가 적용된 상태로 HUD 업데이트
    }

    hitMonster(egg, monster) {
        console.log("Egg hit monster. Damage:", egg.damage);
        monster.hit(egg.damage);
        this.points += 10;
        this.hudScene.update_points(this.points);
        egg.destroy();
    }

    playerHitMonster(player, monster) {
        if (player.canStun) {
            player.stunMonster(monster);
        } else {
            const remainingLives = player.loseLife();
            this.hudScene.updateLives(remainingLives);

            if (remainingLives <= 0) {
                monster.destroy();
                this.gameOver();
            } else {
                this.startHeartSpawnTimer();
            }
        }
    }

    startHeartSpawnTimer() {
        if (!this.isHeartSpawnTimerRunning) {
            this.isHeartSpawnTimerRunning = true;
            this.setNextHeartSpawnTime();
        }
    }

    setNextHeartSpawnTime() {
        const randomDelay = Phaser.Math.Between(10000, 20000); // 10초에서 20초 사이의 랜덤한 시간
        this.lastHeartSpawnTime = this.time.now + randomDelay;
    }

    spawnHeart() {
        if (this.player.getLives() < 5) {
            const x = Phaser.Math.Between(100, this.scale.width - 100);
            const y = Phaser.Math.Between(100, this.scale.height - 100);
            const heart = new Heart(this, x, y);
            this.hearts.add(heart);
            heart.spawn(x, y);
            this.setNextHeartSpawnTime();
        } else {
            this.isHeartSpawnTimerRunning = false;
        }
    }

    collectHeart(player, heart) {
        const newLives = Math.min(player.getLives() + 1, 5);
        player.setLives(newLives);
        this.hudScene.updateLives(newLives);

        if (newLives >= 5) {
            this.isHeartSpawnTimerRunning = false;
        }

        heart.despawn();
    }

    gameOver() {
        console.log("Game Over called");
        this.scene.stop();
        this.scene.start("GameOverScene", {
            points: this.points,
            lastPlayedScene: this.scene.key,
        });
    }

    handlePlayerMovement(delta) {
        const directions = [];
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            directions.push("up");
        }
        if (this.cursors.down.isDown || this.wasd.down.isDown) {
            directions.push("down");
        }
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            directions.push("left");
        }
        if (this.cursors.right.isDown || this.wasd.right.isDown) {
            directions.push("right");
        }

        if (directions.length > 0) {
            this.player.move(directions, delta);
        } else {
            this.player.playIdleAnimation();
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

    startNextRound(nextSceneKey) {
        // 아이템 설명 숨기기
        if (this.itemManager) {
            this.itemManager.hideAllDescriptions();
        }

        this.scene.stop(this.scene.key);
        // 다음 Scene으로 전환 시 fade out 효과 대신 즉시 전환
        this.scene.start(nextSceneKey, {
            x: this.scale.width,
            player: this.player,
            points: this.points,
            lives: this.player.getLives(),
            heldItem: this.player.heldItem,
        });
        this.previousSceneKey = this.scene.key;
    }
}


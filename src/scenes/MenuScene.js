import { Scene } from "phaser";
import { Button } from "../gameobjects/Button";

export class MenuScene extends Scene {
    constructor() {
        super("MenuScene");
    }

    init() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    create() {
        // Backgrounds
        const wallpaper = this.add
            .image(this.x, this.y, "menu")
            .setOrigin(0, 0);
        wallpaper.setDisplaySize(this.scale.width, this.scale.height);

        this.add
            .rectangle(
                0,
                this.scale.height / 4,
                this.scale.width,
                120,
                0xffffff
            )
            .setAlpha(0.8)
            .setOrigin(0, 0.5);

        // Logo
        const logo_game = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4,
            "치킨게임",
            {
                fontFamily: "Impact",
                fontSize: 52,
                color: "#000000",
                fontStyle: "bold",
            }
        );
        logo_game.setOrigin(0.5, 0.5);
        logo_game.postFX.addShine();

        new Button({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2,
            text: "게임 시작",
            onClick: () => {
                this.scene.stop("MenuScene");
                this.scene.start("HudScene");
                this.scene.start("FirstScene", { restart: true });
            },
        });

        new Button({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 + 85,
            text: "게임 설명",
            onClick: () => {
                this.showDialog();
            },
        });

        this.createDialog();
    }

    createDialog() {
        const width = 500;
        const height = this.cameras.main.height * 0.8;

        this.dialog = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );

        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x000000);

        const closeButton = this.add.image(
            width / 2 - 20,
            -height / 2 + 20,
            "close"
        );
        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on("pointerdown", () => this.hideDialog());

        const content = this.add.text(
            0,
            0,
            `
            평화로운 삶을 살고 있던 엄마닭 꼬꼬.
            어느 날 마을에 무서운 황금 돼지가 나타나
            꼬꼬의 소중한 아기 병아리를 납치했다.
            황금 돼지를 무찌르고 아기 병아리를 구해라!

            방향키 혹은 wasd로 이동하고 스페이스바로 공격한다.
            스페이스바를 꾹 누르고 있으면 자동 공격이 된다.
            
            `,
            {
                fontSize: "24px",
                color: "#000000",
                wordWrap: { width: width - 40, useAdvancedWrap: true },
                lineSpacing: 10,
            }
        );
        content.setOrigin(0.5);

        this.dialog.add([background, closeButton, content]);
        this.dialog.setSize(width, height);
        this.dialog.setVisible(false);
    }

    showDialog() {
        this.dialog.setVisible(true);
    }

    hideDialog() {
        this.dialog.setVisible(false);
    }
}


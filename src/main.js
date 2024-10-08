import { Game } from "phaser";
import { Preloader } from "./preloader";
import { GameOverScene } from "./scenes/GameOverScene";
import { HudScene } from "./scenes/HudScene";
import { MenuScene } from "./scenes/MenuScene";
import { FirstScene } from "./scenes/FirstScene";
import { SecondScene } from "./scenes/SecondScene";
import { BossScene } from "./scenes/BossScene";
import { GameClearScene } from "./scenes/GameClearScene";

// More information about config: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    // width: 960,
    // height: 540,
    backgroundColor: "#1c172e",
    pixelArt: true,
    roundPixel: false,
    // max: {
    //     width: 800,
    //     height: 600,
    // },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
        },
    },
    scene: [
        Preloader,
        FirstScene,
        SecondScene,
        BossScene,
        MenuScene,
        HudScene,
        GameOverScene,
        GameClearScene,
    ],
};

new Game(config);

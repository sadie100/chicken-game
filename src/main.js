import { Game } from "phaser";
import { initI18n } from "./i18n/i18n";
import ko from "./i18n/locales/ko.json";
import en from "./i18n/locales/en.json";
import { Preloader } from "./preloader";
import { GameOverScene } from "./scenes/GameOverScene";
import { HudScene } from "./scenes/HudScene";
import { MenuScene } from "./scenes/MenuScene";
import { FirstScene } from "./scenes/FirstScene";
import { SecondScene } from "./scenes/SecondScene";
import { BossScene } from "./scenes/BossScene";
import { GameClearScene } from "./scenes/GameClearScene";

// i18n 초기화
initI18n({ ko, en });

// More information about config: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    width: 480,
    height: 270,
    backgroundColor: "#1c172e",
    pixelArt: true,
    roundPixels: true,
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


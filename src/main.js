import { Game } from "phaser";
import { initI18n } from "./i18n/i18n";
import ko from "./i18n/locales/ko.json";
import en from "./i18n/locales/en.json";
import { Preloader } from "./preloader";
import { GameOverScene } from "./scenes/GameOverScene";
import { ContinueScene } from "./scenes/ContinueScene";
import { HudScene } from "./scenes/HudScene";
import { MenuScene } from "./scenes/MenuScene";
import { FirstScene } from "./scenes/FirstScene";
import { SecondScene } from "./scenes/SecondScene";
import { BossScene } from "./scenes/BossScene";
import { GameClearScene } from "./scenes/GameClearScene";

// i18n 초기화
initI18n({ ko, en });

// 전역 기본 폰트: 폰트를 명시하지 않은 모든 add.text를 Galmuri11(한글 픽셀 폰트)로 렌더링
// (로고 Impact 등 명시적으로 폰트를 준 곳은 그대로 유지된다)
// 내장 "text" 팩토리는 이미 등록돼 있어 register()로는 덮어쓸 수 없으므로 프로토타입에 직접 할당한다.
Phaser.GameObjects.GameObjectFactory.prototype.text = function (
    x,
    y,
    text,
    style
) {
    style = style || {};
    if (!style.fontFamily && !style.font) {
        style.fontFamily = "Galmuri11";
    }
    return this.displayList.add(
        new Phaser.GameObjects.Text(this.scene, x, y, text, style)
    );
};

// More information about config: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    // width: window.innerWidth,
    // height: window.innerHeight,
    width: 1280,
    height: 720,
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
        ContinueScene,
        GameClearScene,
    ],
};

new Game(config);

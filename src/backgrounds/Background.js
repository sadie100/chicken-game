// Background 클래스 (이전과 동일)
export class Background {
    constructor(scene, key) {
        this.scene = scene;
        this.key = key;
        this.layers = [];
        this.scrollSpeeds = [0.1, 0.3, 0.5, 0.7];
    }

    create() {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        for (let i = 1; i <= 4; i++) {
            this.createLayer(
                `${this.key}_${i}`,
                this.scrollSpeeds[i - 1],
                gameWidth,
                gameHeight
            );
        }
    }

    createLayer(key, scrollFactor, width, height) {
        const image = this.scene.textures.get(key);
        const sourceWidth = image.source[0].width;
        const sourceHeight = image.source[0].height;

        const scale = height / sourceHeight;

        const layer = this.scene.add.tileSprite(0, 0, width, height, key);
        layer.setOrigin(0, 0);
        layer.setScrollFactor(0);

        layer.setScale(scale);
        layer.tileScaleX = 1 / scale;
        layer.tileScaleY = 1;

        this.layers.push({ sprite: layer, scrollFactor: scrollFactor });
    }

    update(delta) {
        this.layers.forEach((layer) => {
            layer.sprite.tilePositionX += layer.scrollFactor * delta * 0.1;
        });
    }
}

export class BossHealthBar {
    width = 300;
    constructor(scene) {
        this.scene = scene;
        this.x = (this.scene.scale.width - this.width) / 2;
        this.y = 100;

        this.fill = scene.add
            .image(this.x, this.y, "health_bar_fill")
            .setOrigin(0, 0.5);
        this.border = scene.add
            .image(this.x, this.y, "health_bar_border")
            .setOrigin(0, 0.5);

        // 이미지의 원래 비율 유지
        const aspectRatio = this.border.height / this.border.width;
        this.height = this.width * aspectRatio;

        this.border.setDisplaySize(this.width, this.height);
        this.fill.setDisplaySize(this.width, this.height);

        this.setValue(1);
    }

    setValue(percentage) {
        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        // fill 이미지의 너비를 직접 조절
        this.fill.displayWidth = this.width * percentage;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.border.setPosition(x, y);
        this.fill.setPosition(x, y);
    }

    destroy() {
        this.border.destroy();
        this.fill.destroy();
    }
}


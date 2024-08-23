export class BossHealthBar {
    initialWidth = 300;
    constructor(scene) {
        this.scene = scene;
        this.width = this.initialWidth;
        this.x = (this.scene.scale.width - this.width) / 2;
        this.y = 100;

        this.border = scene.add
            .image(this.x, this.y, "health_bar_border")
            .setOrigin(0, 0.5);
        this.fill = scene.add
            .image(this.x, this.y, "health_bar_fill")
            .setOrigin(0, 0.5);

        // 이미지의 원래 비율 유지
        const aspectRatio = this.border.height / this.border.width;
        this.height = this.width * aspectRatio;

        this.border.setDisplaySize(this.width, this.height);
        this.fill.setDisplaySize(this.width, this.height);

        // 초기 crop 설정
        this.fill.setCrop(0, 0, this.width, this.height);

        this.setValue(1);
    }

    setValue(percentage) {
        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        // crop을 사용하여 fill 이미지의 보이는 부분을 조절
        const cropWidth = 125 * percentage;
        this.fill.setCrop(0, 0, cropWidth, this.height);
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


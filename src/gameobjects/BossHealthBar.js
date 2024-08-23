export class BossHealthBar {
    height = 90;
    width = 450;
    constructor(scene) {
        this.scene = scene;
        this.x = (this.scene.scale.width - this.width) / 2;
        this.y = 100;

        this.border = scene.add
            .image(this.x, this.y, "health_bar_border")
            .setOrigin(0, 0.5);
        this.fill = scene.add
            .image(this.x, this.y, "health_bar_fill")
            .setOrigin(0, 0.5);

        // 이미지의 원래 비율 유지
        this.border.setDisplaySize(this.width, this.height);
        this.fill.setDisplaySize(this.width, this.height);

        // 체력바를 크롭하기 위한 마스크 생성
        this.fillMask = scene.make.graphics({});
        this.fillMask.fillStyle(0xffffff);
        this.fillMask.fillRect(
            this.x,
            this.y - this.height / 2,
            this.width,
            this.height
        );

        this.fill.setMask(this.fillMask.createGeometryMask());

        this.setValue(1);
    }

    setValue(percentage) {
        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        // 마스크를 업데이트하여 체력바를 크롭
        this.fillMask.clear();
        this.fillMask.fillStyle(0xffffff);
        console.log(this.width * percentage);
        this.fillMask.fillRect(
            this.x,
            this.y - this.height / 2,
            this.width * percentage,
            this.height
        );
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.border.setPosition(x, y);
        this.fill.setPosition(x, y);
        this.fillMask.x = x - this.width / 2;
        this.fillMask.y = y - this.height / 2;
    }

    destroy() {
        this.border.destroy();
        this.fill.destroy();
        this.fillMask.destroy();
    }
}


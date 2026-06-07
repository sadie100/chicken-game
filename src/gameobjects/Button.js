// 청키 픽셀 버튼: 두꺼운 테두리 + 하드 드롭섀도우 + 상단 하이라이트,
// hover 시 살짝 커지고 밝아지며, 누르면 그림자만큼 쑥 내려가는 "눌리는" 피드백.
// primary 버튼은 시선을 끌도록 노란색 + 잔잔한 바운스.
const PALETTES = {
    primary: {
        fill: 0xffcf3f,
        hover: 0xffe07a,
        press: 0xe9b52e,
        border: 0xb9831a,
        shadow: 0x8a5e10,
        text: "#4a2f00",
    },
    secondary: {
        fill: 0xfff6e6,
        hover: 0xffffff,
        press: 0xece0c6,
        border: 0x9a8a66,
        shadow: 0x6f6347,
        text: "#4a3a1a",
    },
};

export class Button {
    constructor({
        scene,
        x,
        y,
        text,
        onClick,
        primary = false,
        width = 320,
        height = 64,
        fontSize = 28,
    }) {
        this.scene = scene;
        this.onClick = onClick;
        this.width = width;
        this.height = height;
        this.radius = 14;
        this.shadowOffset = 6;
        this.palette = primary ? PALETTES.primary : PALETTES.secondary;

        this.container = scene.add.container(x, y);
        this.baseY = y;

        // 그림자 (고정)
        this.shadowGfx = scene.add.graphics();
        this.shadowGfx.fillStyle(this.palette.shadow, 1);
        this.shadowGfx.fillRoundedRect(
            -width / 2,
            -height / 2 + this.shadowOffset,
            width,
            height,
            this.radius
        );

        // 본체(face): 누르면 그림자 위로 내려앉는다
        this.face = scene.add.container(0, 0);
        this.bodyGfx = scene.add.graphics();
        this.label = scene.add
            .text(0, 0, text, {
                fontFamily: "Galmuri11",
                fontSize,
                color: this.palette.text,
                align: "center",
            })
            .setOrigin(0.5);
        this.face.add([this.bodyGfx, this.label]);
        this.drawFace(this.palette.fill);

        this.container.add([this.shadowGfx, this.face]);

        this.container.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -width / 2,
                -height / 2,
                width,
                height + this.shadowOffset
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true,
        });

        this.container.on("pointerover", () => this.setHover());
        this.container.on("pointerout", () => this.setNormal());
        this.container.on("pointerdown", () => this.setPressed());
        this.container.on("pointerup", () => {
            this.setHover();
            if (this.onClick) {
                this.onClick();
            }
        });

        // primary 버튼은 시선 유도용으로 잔잔하게 바운스
        if (primary) {
            scene.tweens.add({
                targets: this.container,
                y: this.baseY - 5,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: "Sine.inOut",
            });
        }

        // 기존 코드 호환: button.setText(...) 가 동작하도록 라벨을 노출
        this.button = this.label;
    }

    drawFace(fillColor) {
        const w = this.width;
        const h = this.height;
        const r = this.radius;
        const x = -w / 2;
        const y = -h / 2;
        const g = this.bodyGfx;
        g.clear();
        g.fillStyle(fillColor, 1);
        g.fillRoundedRect(x, y, w, h, r);
        g.lineStyle(4, this.palette.border, 1);
        g.strokeRoundedRect(x, y, w, h, r);
        // 상단 하이라이트 (픽셀 광택)
        g.fillStyle(0xffffff, 0.25);
        g.fillRoundedRect(x + 6, y + 5, w - 12, h * 0.3, {
            tl: r - 4,
            tr: r - 4,
            bl: 0,
            br: 0,
        });
    }

    scaleTo(scale) {
        this.scene.tweens.add({
            targets: this.container,
            scaleX: scale,
            scaleY: scale,
            duration: 120,
            ease: "Back.out",
        });
    }

    setNormal() {
        this.drawFace(this.palette.fill);
        this.face.y = 0;
        this.scaleTo(1);
    }

    setHover() {
        this.drawFace(this.palette.hover);
        this.face.y = 0;
        this.scaleTo(1.05);
    }

    setPressed() {
        this.drawFace(this.palette.press);
        this.face.y = this.shadowOffset;
    }
}

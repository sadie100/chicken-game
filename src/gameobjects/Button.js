export class Button {
    constructor({ scene, x, y, text, onClick }) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.text = text;
        this.onClick = onClick;

        const button = scene.add
            .text(x, y, text, {
                fontSize: "32px",
                padding: { top: 20, bottom: 20 },
                backgroundColor: "gray",
                color: "#ffffff",
                align: "center",
                fixedWidth: 300,
            })
            .setAlpha(0.9)
            .setOrigin(0.5, 0.5);

        button.setInteractive({ useHandCursor: true });
        button.on("pointerdown", onClick);
        this.button = button;
    }
}


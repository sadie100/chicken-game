export class ItemButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texture, id) {
        super(scene, x, y);

        this.id = id;
        this.button = scene.add.image(0, 0, texture);
        this.add(this.button);

        this.setSize(this.button.width, this.button.height);
        this.setInteractive();

        this.on("pointerdown", this.onPointerDown, this);
    }

    onPointerDown() {
        this.scene.events.emit("itemSelected", this.id);
    }

    setSelected(selected) {
        if (selected) {
            this.button.setTint(0x00ff00);
        } else {
            this.button.clearTint();
        }
    }
}

export class ToggleButtonGroup {
    constructor(scene) {
        this.scene = scene;
        this.buttons = [];
        this.selectedButton = null;
    }

    addButton(x, y, texture, id) {
        const button = new ItemButton(this.scene, x, y, texture, id);
        this.buttons.push(button);
        this.scene.add.existing(button);

        return button;
    }

    onItemSelected(id) {
        this.buttons.forEach((button) => {
            button.setSelected(button.id === id);
        });
        this.selectedButton = id;
    }

    getSelectedItem() {
        return this.selectedButton;
    }
}

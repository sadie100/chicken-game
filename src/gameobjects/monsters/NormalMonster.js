import { Monster } from "./Monster";

export class NormalMonster extends Monster {
    speed = 100;
    health = 3;
    isStunned = false;
    stunDuration = 1000; // 1초간 기절
    direction = 0; // y축 이동 각도

    constructor(scene, x, y, texture, speed, direction) {
        super(scene, x, y, texture);
        this.direction = direction; // y축 이동 각도 설정
    }

    update(time, delta) {
        if (!this.isStunned) {
            // x축 이동 (항상 왼쪽으로)
            const dx = -this.speed * (delta / 1000);

            this.x += dx;

            const dy = this.speed * (delta / 1000) * Math.random();
            // y축 이동 (각도에 따라 위 또는 아래로)
            if (this.direction === "down") {
                this.y += dy;
            } else if (this.direction === "up") {
                this.y -= dy;
            }
        }

        if (
            this.x < -this.width ||
            this.x > this.scene.scale.width + this.width ||
            this.y < -this.height ||
            this.y > this.scene.scale.height + this.height
        ) {
            this.destroy();
        }
    }
}


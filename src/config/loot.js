import { ITEM_DEFS } from "./items";

export function getDropRateForMonster(name) {
    switch (name) {
        case "Cat":
            return 0.3;
        case "Pig":
            return 0.2;
        default:
            return 0.2;
    }
}

const DEFAULT_TABLE = [
    { id: "BulletBooster", w: 3 },
    { id: "EggSpeedBooster", w: 3 },
    { id: "SpeedBooster", w: 2 },
    { id: "EggSizeBooster", w: 2 },
];

export function pickDropFor(monster, player) {
    const monsterName =
        monster && monster.constructor && monster.constructor.name;
    // 플레이어 상태로 상한 도달 아이템 제외
    const filtered = DEFAULT_TABLE.filter((entry) => {
        const def = ITEM_DEFS[entry.id];
        if (!def) return false;
        const key = def.effectKey;
        const max = def.maxStacks ?? Infinity;
        if (!key) return true;
        const current = player?.activeEffects?.[key] ?? 0;
        if (current >= max) return false;

        // 특정 몬스터 전용 아이템 필터링
        const allowed = def.allowedMonsters;
        if (Array.isArray(allowed) && allowed.length > 0) {
            return allowed.includes(monsterName);
        }
        return true;
    });

    if (filtered.length === 0) return null;

    const total = filtered.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const entry of filtered) {
        if ((r -= entry.w) < 0) {
            const def = ITEM_DEFS[entry.id];
            if (!def) return null;
            return { id: entry.id, texture: def.texture, frame: def.frame };
        }
    }
    return null;
}

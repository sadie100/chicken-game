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

export function pickDropFor(monster) {
    const table = DEFAULT_TABLE;
    const total = table.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const entry of table) {
        if ((r -= entry.w) < 0) {
            const def = ITEM_DEFS[entry.id];
            if (!def) return null;
            return { id: entry.id, texture: def.texture, frame: def.frame };
        }
    }
    return null;
}

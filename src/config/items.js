export const MAX_STACK = {
    bullet: 5,
    eggSpeed: 5,
    eggSize: 5,
    speed: 10,
    powerEgg: 1,
};

export const ITEM_DEFS = {
    BulletBooster: {
        texture: "itemList2",
        frame: 5,
        effectKey: "bullet",
        maxStacks: MAX_STACK.bullet,
        description: "달걀 데미지를 강화합니다.",
        apply: (player) => player.addEffect("bullet", 1, MAX_STACK.bullet),
        remove: (player) => player.removeEffect("bullet", 1),
        allowedMonsters: ["cat"],
    },
    EggSpeedBooster: {
        texture: "itemList1",
        frame: 1,
        effectKey: "eggSpeed",
        maxStacks: MAX_STACK.eggSpeed,
        description: "달걀이 발사되는 속도가 빨라집니다.",
        apply: (player) => player.addEffect("eggSpeed", 1, MAX_STACK.eggSpeed),
        remove: (player) => player.removeEffect("eggSpeed", 1),
        allowedMonsters: ["cat", "pig"],
    },
    EggSizeBooster: {
        texture: "itemList2",
        frame: 11,
        effectKey: "eggSize",
        maxStacks: MAX_STACK.eggSize,
        description: "달걀 크기가 커집니다.",
        apply: (player) => player.addEffect("eggSize", 1, MAX_STACK.eggSize),
        remove: (player) => player.removeEffect("eggSize", 1),
        allowedMonsters: ["cat"],
    },
    SpeedBooster: {
        texture: "itemList1",
        frame: 3,
        effectKey: "speed",
        maxStacks: MAX_STACK.speed,
        description: "이동속도가 빨라집니다.",
        apply: (player) => player.addEffect("speed", 1, MAX_STACK.speed),
        remove: (player) => player.removeEffect("speed", 1),
        allowedMonsters: ["cat", "pig"],
    },
    PowerEgg: {
        texture: "itemList3",
        frame: 28,
        effectKey: "powerEgg",
        maxStacks: MAX_STACK.powerEgg,
        description: "5초간 달걀을 세 갈래로 발사합니다.",
        apply: (player) =>
            player.addTimedEffect("powerEgg", 5000, MAX_STACK.powerEgg),
        remove: (player) => player.removeEffect("powerEgg", 1),
        allowedMonsters: ["cat", "pig"],
    },
    // StunAbility: {
    //     texture: "itemList2",
    //     frame: 0, // 필요 시 실제 프레임으로 변경
    //     description:
    //         "알에 맞은 몬스터를 잠시 기절시키는 능력을 얻습니다. 보스 몬스터에는 통하지 않습니다.",
    //     apply: (player) => player.addEffect("stun", 1),
    //     remove: (player) => player.removeEffect("stun", 1),
    // },
};

// 아이템 기본 수명/깜빡임 설정 (개별 아이템에서 timing으로 오버라이드 가능)
export const ITEM_TIMING_DEFAULT = {
    lifetimeMs: 10000, // 스폰 후 소멸하기까지의 시간
    blinkStartMs: 5000, // 깜빡임이 시작되는 시간
    blinkIntervalMs: 150, // 깜빡임 주기(ms)
};

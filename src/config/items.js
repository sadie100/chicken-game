export const ITEM_DEFS = {
    // BulletBooster: {
    //     texture: "itemList1",
    //     frame: 0,
    //     description: "달걀 데미지를 강화합니다.",
    //     apply: (player) => player.addEffect("bullet", 1),
    //     remove: (player) => player.removeEffect("bullet", 1),
    // },
    EggSpeedBooster: {
        texture: "itemList1",
        frame: 1,
        description: "달걀이 발사되는 속도가 빨라집니다.",
        apply: (player) => player.addEffect("eggSpeed", 1),
        remove: (player) => player.removeEffect("eggSpeed", 1),
    },
    // EggSizeBooster: {
    //     texture: "itemList1",
    //     frame: 2,
    //     description: "달걀 크기가 커집니다.",
    //     apply: (player) => player.addEffect("eggSize", 1),
    //     remove: (player) => player.removeEffect("eggSize", 1),
    // },
    SpeedBooster: {
        texture: "itemList1",
        frame: 3,
        description: "이동속도가 빨라집니다.",
        apply: (player) => player.addEffect("speed", 1),
        remove: (player) => player.removeEffect("speed", 1),
    },
    StunAbility: {
        texture: "itemList2",
        frame: 0, // 필요 시 실제 프레임으로 변경
        description:
            "알에 맞은 몬스터를 잠시 기절시키는 능력을 얻습니다. 보스 몬스터에는 통하지 않습니다.",
        apply: (player) => player.addEffect("stun", 1),
        remove: (player) => player.removeEffect("stun", 1),
    },
};

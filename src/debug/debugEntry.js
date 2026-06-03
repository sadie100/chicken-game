import { MAX_STACK } from "../config/items";

// QA/개발용: URL 쿼리 파라미터로 특정 씬에 바로 진입한다.
// 예) ?scene=boss            보스전 바로 진입
//     ?scene=boss&items=max  보스전 + 모든 아이템 최대치
//     ?scene=first / ?scene=second
// 개발 빌드(import.meta.env.DEV)에서만 동작하며, 배포본에는 영향이 없다.

// ergonomic URL용 별칭 → 실제 씬 키
const SCENE_ALIASES = {
    first: "FirstScene",
    second: "SecondScene",
    boss: "BossScene",
    menu: "MenuScene",
};

// HudScene을 병렬로 띄워야 하는 게임플레이 씬
const GAMEPLAY_SCENES = new Set(["FirstScene", "SecondScene", "BossScene"]);

// items=max 일 때 주입할 effects (MenuScene의 테스트 코드와 동일)
function buildMaxEffects() {
    return {
        bullet: MAX_STACK.bullet,
        eggSpeed: MAX_STACK.eggSpeed,
        eggSize: MAX_STACK.eggSize,
        speed: MAX_STACK.speed,
        powerEgg: 0, // PowerEgg는 시간 제한이 있어서 0으로 시작
    };
}

// Preloader가 호출한다. 디버그 씬을 시작했으면 true, 아니면 false를 반환한다.
export function tryStartDebugScene(scene) {
    if (!import.meta.env.DEV) {
        return false;
    }

    const params = new URLSearchParams(window.location.search);
    const requested = params.get("scene");
    if (!requested) {
        return false;
    }

    const target = SCENE_ALIASES[requested.toLowerCase()] || requested;
    if (!scene.scene.manager.keys[target]) {
        console.warn(
            `[debug] 알 수 없는 씬: "${requested}" → MenuScene으로 폴백합니다.`
        );
        return false;
    }

    if (GAMEPLAY_SCENES.has(target)) {
        const effects = params.get("items") === "max" ? buildMaxEffects() : null;
        scene.scene.start("HudScene");
        scene.scene.start(target, {
            restart: true,
            ...(effects && { effects }),
        });
    } else {
        scene.scene.start(target);
    }

    console.info(`[debug] "${target}" 씬으로 바로 진입합니다.`);
    return true;
}

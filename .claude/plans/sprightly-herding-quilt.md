# QA용 씬 직접 진입(URL 파라미터) 기능

## Context

치킨게임은 `Preloader → MenuScene → FirstScene → SecondScene → BossScene → GameClearScene` 순으로만 진행되어, BossScene 같은 후반 씬을 검증하려면 매번 게임을 처음부터 직접 플레이해야 한다. Playwright/Chrome DevTools 등으로 **자동화된 QA**를 하려면 클릭 시퀀스 없이 결정적으로 특정 씬에 진입할 수 있어야 한다.

해결책: **URL 쿼리 파라미터**(`?scene=boss`)로 원하는 씬에 바로 부팅한다. 사용자 결정사항:
- 트리거: **URL 쿼리 파라미터** (Playwright가 navigate만으로 진입)
- 진입 상태: **씬별 합리적 기본값** + 옵션 `&items=max` 로 모든 아이템 최대치
- 안전장치: **개발 빌드에서만 활성** (`import.meta.env.DEV`) — 배포본에는 미포함

이 기능은 게임 로직을 전혀 건드리지 않는다. 기존 `init(data)` 진입 경로(이미 `effects`/`lives`/`restart`를 받도록 설계됨)를 그대로 재사용한다.

## 핵심 발견사항 (재사용할 기존 구조)

- [src/scenes/BaseScene.js:28-51](src/scenes/BaseScene.js#L28-L51) — `init(data)`가 이미 `effects`(테스트용 직접 주입), `points`, `lives`, `restart`를 처리. **추가 씬 수정 불필요.**
- [src/scenes/MenuScene.js:59-61](src/scenes/MenuScene.js#L59-L61) — 게임플레이 씬 진입 패턴: `HudScene` 먼저 `start` → 게임 씬 `start({ restart: true })`. 디버그 진입도 이 패턴을 그대로 따라야 함(HUD 의존성).
- [src/scenes/MenuScene.js:63-73](src/scenes/MenuScene.js#L63-L73) — 주석 처리된 BossScene+maxed items 테스트 코드. `effects` 객체 형태의 정답 레퍼런스.
- [src/preloader.js:92-100](src/preloader.js#L92-L100) — `create()`에서 `SoundManager`를 registry에 등록한 뒤 `MenuScene` 시작. **모든 의존성이 준비된 유일한 분기 지점.**
- [src/config/items.js:1-7](src/config/items.js#L1-L7) — `MAX_STACK` (bullet:5, eggSpeed:5, eggSize:5, speed:10, powerEgg:1). `items=max` 빌드에 사용.

## 구현

### 1. 디버그 진입 헬퍼 (신규 파일)

`src/debug/debugEntry.js` 생성. Preloader 로직을 깔끔하게 유지하기 위해 분리.

- `export function tryStartDebugScene(scene)` — Preloader가 호출. **씬을 시작했으면 `true`, 아니면 `false` 반환.**
- 동작:
  1. `if (!import.meta.env.DEV) return false;` — 개발 빌드 전용 게이트.
  2. `const params = new URLSearchParams(window.location.search);` 로 `scene` 파라미터 읽기.
  3. 없으면 `return false`.
  4. 별칭 맵으로 정규화 (ergonomic Playwright URL용):
     `{ first: "FirstScene", second: "SecondScene", boss: "BossScene", menu: "MenuScene" }`.
     정확한 씬 키(`BossScene` 등)도 그대로 허용. 유효하지 않으면 `console.warn` 후 `return false`(→ MenuScene 폴백).
  5. 게임플레이 씬(`FirstScene`/`SecondScene`/`BossScene`) 집합이면:
     - `&items=max` 일 때 [src/scenes/MenuScene.js:66-72](src/scenes/MenuScene.js#L66-L72) 와 동일한 `effects` 객체 구성 (`MAX_STACK` 사용, `powerEgg: 0`).
     - `scene.scene.start("HudScene");` 먼저 → `scene.scene.start(target, { restart: true, ...(effects && { effects }) });`
  6. 그 외(`MenuScene` 등)는 HUD 없이 `scene.scene.start(target)` 직접 시작.
  7. `console.info`로 어떤 씬에 디버그 진입했는지 로깅.

### 2. Preloader 분기 연결

[src/preloader.js:100](src/preloader.js#L100) 의 `this.scene.start("MenuScene");` 를 다음으로 교체:

```js
import { tryStartDebugScene } from "./debug/debugEntry";
// ...
if (!tryStartDebugScene(this)) {
    this.scene.start("MenuScene");
}
```

기존 동작은 100% 보존 — 파라미터가 없거나 프로덕션 빌드면 항상 `MenuScene`로 폴백.

### 변경 파일 요약
- **신규**: [src/debug/debugEntry.js](src/debug/debugEntry.js)
- **수정**: [src/preloader.js](src/preloader.js) — import 1줄 + 시작 분기 3줄

## 사용 예시 (QA)

```
http://localhost:5173/?scene=boss            # 보스전 바로 진입(기본 라이프)
http://localhost:5173/?scene=boss&items=max  # 보스전 + 모든 아이템 최대치
http://localhost:5173/?scene=second           # 2스테이지
http://localhost:5173/?scene=first            # 1스테이지
```

Playwright: `browser_navigate("http://localhost:5173/?scene=boss&items=max")` 한 번으로 진입.

## Verification

1. `npm run dev` 실행.
2. **기존 경로 회귀 확인**: `localhost:5173/` (파라미터 없음) → MenuScene 정상 표시, Play 버튼으로 FirstScene 진입되는지.
3. **디버그 진입**: `?scene=boss` → 보스전 화면이 바로 뜨고, HUD(라이프/포인트/시간)가 정상 표시되며, 콘솔 에러(특히 `soundManager`/`hudScene` null 참조) 없는지 — Playwright `browser_navigate` + `browser_console_messages` + `browser_take_screenshot`로 확인.
4. **items=max**: `?scene=boss&items=max` → 발사 시 달걀이 강화/다발(멀티샷) 상태인지 스크린샷으로 육안 확인.
5. **잘못된 값 폴백**: `?scene=nonsense` → `console.warn` 후 MenuScene로 폴백되는지.
6. **프로덕션 게이트**: `npm run build && npm run preview` 후 `?scene=boss` → 디버그 진입이 **무시되고** MenuScene가 뜨는지(`import.meta.env.DEV === false`).
```

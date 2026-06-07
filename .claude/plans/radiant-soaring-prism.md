# Continue 시스템으로 게임오버 흐름 변경

## Context

현재는 체력이 0이 되면 즉시 `GameOverScene`으로 전환되고, 클릭하면 해당 스테이지를 **처음부터** 다시 시작한다(`restart: true` → `resetScene`). 이 "처음부터 재시작" 방식 대신, 죽은 그 자리에서 이어서 플레이할 수 있는 **Continue 카운트다운** 시스템으로 바꾼다.

원하는 동작:
1. 체력이 다 닳으면 꼬꼬가 **burst(터지는 연출)** 하고 게임이 멈춘다.
2. "GAME OVER / Continue?" 오버레이와 함께 **10 → 0 카운트다운**이 진행된다.
3. 카운트다운 안에 **엔터 또는 클릭**하면 부활 → 죽은 그 상태(위치·진행·아이템 그대로)에서 계속 플레이.
4. 카운트다운이 0이 되면 기존 `GameOverScene`(점수 표시)으로 이동.

확정된 규칙:
- 부활 시 체력 **풀피(5칸)** 회복.
- Continue **무제한**. 단, **죽을 때마다 점수 −500** (최소 0). 페널티는 죽는 순간 적용되므로, 이어하든 타임아웃되든 동일하게 반영된다.

## 죽음 경로 (단일 진입점)

체력 0 처리는 두 곳에서 호출되지만 **모두 `BaseScene.gameOver()`를 거친다**:
- 일반 몬스터 접촉: [BaseScene.js:267-281](src/scenes/BaseScene.js#L267-L281) `playerHitMonster` → `gameOver()`
- 보스 탄환: [BossScene.js:113-123](src/scenes/BossScene.js#L113-L123) `playerHitBullet` → `gameOver()`

따라서 `BaseScene.gameOver()` 한 곳만 바꾸면 보스전 포함 모든 경로가 새 흐름을 탄다.

## 설계 개요

게임 씬을 **`this.scene.pause()`**로 멈추면 update 루프·타이머·물리·트윈이 전부 정지하므로 몬스터/보스/탄환이 자연스럽게 얼어붙는다. 카운트다운과 입력은 별도의 **`ContinueScene`**(오버레이 씬)이 담당한다. `HudScene`는 원래 병렬로 도는 독립 씬이라 영향 없음.

흐름:
```
체력 0 → BaseScene.gameOver()
  ├─ (재진입 가드) 이미 죽는 중이면 무시
  ├─ 점수 −500, HUD 갱신
  ├─ player.playBurst()  (트윈 연출, 무적+발사정지)
  └─ burst 완료 시:
        this.scene.launch("ContinueScene", { parentSceneKey, points })
        this.scene.pause()           // 게임 씬 정지(몬스터/보스/탄환 freeze)

ContinueScene
  ├─ 반투명 오버레이 + "GAME OVER" + "Continue?" + 큰 카운트다운(10→0)
  ├─ time.addEvent({delay:1000, loop:true})로 1초마다 감소
  ├─ ENTER / pointerdown → onContinue()
  │     this.scene.resume(parentSceneKey)
  │     parent.events.emit("revive")
  │     this.scene.stop()            // ContinueScene 종료
  └─ 0 도달(타임아웃) → onTimeout()
        this.scene.stop(parentSceneKey)
        this.scene.stop()
        this.scene.start("GameOverScene", { points, lastPlayedScene: parentSceneKey })

BaseScene revivePlayer()  (events.once("revive")로 연결)
  ├─ player.resetFromBurst()  (alpha/scale/tint/visible 복구, idle 재생)
  ├─ player.setLives(5) + hudScene.updateLives(5)
  └─ 부활 직후 무적 ~2.5초 + 점멸(겹쳐있던 몬스터·탄환에 즉사 방지)
```

## 변경 파일

### 1. `src/gameobjects/Player.js` — burst / 복구 / 부활 무적
기존 `flashRed()`([Player.js:310-323](src/gameobjects/Player.js#L310-L323)) 트윈 패턴을 그대로 따른다(별도 스프라이트 없음).

- `playBurst(onComplete)`: 발사 중지(`setData("isFiring", false)`), `isInvulnerable = true`, 애니메이션 정지 후 트윈으로 스케일 업 + 회전 + `alpha→0`(예: tint 흰색, scale 3→5, angle 회전, duration ~500ms). 완료 시 `setVisible(false)` 후 `onComplete()` 호출.
- `resetFromBurst()`: `setVisible(true)`, `setAlpha(1)`, `setScale(3)`(생성자 기본값), `setAngle(0)`, `clearTint()`, `playIdleAnimation()`.
- `setInvulnerable(durationMs)`: `isInvulnerable = true`로 두고 점멸 트윈(yoyo/repeat) 후 `durationMs` 뒤 `isInvulnerable = false` + `clearTint()`. 기존 `loseLife()`가 이미 `isInvulnerable`를 존중([Player.js:298](src/gameobjects/Player.js#L298))하므로 무적 동안 추가 피해 없음.

### 2. `src/scenes/BaseScene.js` — gameOver를 Continue 흐름으로 교체
`gameOver()`([BaseScene.js:320-327](src/scenes/BaseScene.js#L320-L327)) 재작성:
- 재진입 가드 `if (this.isPlayerDead) return; this.isPlayerDead = true;`
- 점수 페널티: `this.points = Math.max(0, this.points - 500); this.hudScene.update_points(this.points);`
- `this.events.once("revive", this.revivePlayer, this);`
- `this.player.playBurst(() => { this.scene.launch("ContinueScene", { parentSceneKey: this.scene.key, points: this.points }); this.scene.pause(); });`

`revivePlayer()` 신규 메서드:
- `this.isPlayerDead = false;`
- `this.player.resetFromBurst();`
- `this.player.setLives(5); this.hudScene.updateLives(5);`
- `this.player.setInvulnerable(2500);`

참고: 페널티는 한 곳(`gameOver`)에서만 적용되므로 보스/일반 경로 모두 자동 반영. `playerHitMonster`의 `monster.destroy()`는 그대로 두되, gameOver가 burst를 비동기로 처리해도 무방.

### 3. `src/scenes/ContinueScene.js` — 신규 오버레이 씬
- `init(data)`: `this.parentSceneKey`, `this.points` 저장. `this.countdown = 10`.
- `create()`:
  - 전체화면 반투명 검정 `rectangle`(alpha ~0.6, depth 높게).
  - "GAME OVER"(Galmuri11, GameOverScene와 톤 맞춤) + `t("continue.prompt")` + 큰 카운트다운 숫자 + `t("continue.hint")`.
  - `this.time.addEvent({ delay: 1000, loop: true, callback: tick })`로 매초 `countdown--`, 텍스트 갱신, 0 도달 시 `onTimeout()`.
  - `this.input.keyboard.on("keydown-ENTER", onContinue)` + `this.input.on("pointerdown", onContinue)`.
  - 효과음은 선택: 매초 틱 사운드는 생략(기존 자산 없음). 부활/타임아웃 시 기존 사운드 재사용 가능.
- `onContinue()`: 중복 방지 플래그, 타이머 제거, `this.scene.resume(this.parentSceneKey)`, `this.scene.get(this.parentSceneKey).events.emit("revive")`, `this.scene.stop()`.
- `onTimeout()`: `this.scene.stop(this.parentSceneKey)`, `this.scene.start("GameOverScene", { points: this.points })`, `this.scene.stop()`. (`lastPlayedScene`은 더 이상 필요 없음 — 아래 GameOverScene 변경 참고.)

### 4. `src/scenes/GameOverScene.js` — 클릭 시 메뉴로, HUD 정리
이제 GameOverScene은 Continue 타임아웃 경로로만 도달한다.
- 클릭 동작([GameOverScene.js:83-90](src/scenes/GameOverScene.js#L83-L90)): `this.scene.start(this.lastPlayedScene, { restart: true })` → **`this.scene.start("MenuScene")`** 로 교체("처음부터 재시작" 폐기).
- 진입 시 `this.scene.stop("HudScene")` 호출(create 초입). `HudScene`는 [MenuScene.js:60](src/scenes/MenuScene.js#L60)에서 start된 뒤 stop된 적이 없어, 그대로 두면 GameOverScene·이후 MenuScene 위에 낡은 HUD가 겹친다. 게임오버 시점에 정리.
- `lastPlayedScene` 관련 코드([GameOverScene.js:4,13](src/scenes/GameOverScene.js#L13))는 이제 미사용 → 제거(내 변경으로 생긴 orphan 정리). `init`은 `points`만 받는다.

### 5. `src/main.js` — 씬 등록
scene 배열([main.js:60-69](src/main.js#L60-L69))에 `ContinueScene` 추가(import 포함).

### 6. `src/i18n/locales/ko.json` & `en.json` — 문자열 추가
`continue` 섹션 신설:
- ko: `{ "title": "GAME OVER", "prompt": "계속하시겠습니까?", "hint": "ENTER 또는 클릭" }`
- en: `{ "title": "GAME OVER", "prompt": "Continue?", "hint": "PRESS ENTER OR CLICK" }`
`ContinueScene`에서 `t("continue.title")` 등으로 사용.

## 기존 코드 유지/주의

- `BaseScene.resetScene`/`init`의 `restart` 분기([BaseScene.js:48-58](src/scenes/BaseScene.js#L48-L58))는 MenuScene 플레이 버튼([MenuScene.js:61](src/scenes/MenuScene.js#L61))과 디버그 진입([debugEntry.js:53](src/debug/debugEntry.js#L53))에서 여전히 쓰이므로 **건드리지 않는다**. GameOverScene만 `restart` 사용을 끊는다.
- 씬 일시정지 중 `HudScene`는 계속 동작(별도 씬). 부활 시 우리가 명시적으로 `updateLives(5)`/점수 갱신을 호출하므로 표시 동기화 OK. `HudScene` 종료는 진짜 게임오버(GameOverScene 진입) 시점에만 일어난다.

## 검증 (수동)

테스트 빌드 없음 → 브라우저 수동 확인. `npm run dev` 후:
1. **일반 스테이지 사망**: 몬스터에 5번 맞아 체력 0 → 꼬꼬 burst, 화면 정지, "GAME OVER / 계속하시겠습니까?" + 10→0 카운트다운 표시.
2. **부활(엔터)**: 카운트다운 중 엔터 → 같은 위치에서 풀피로 부활, 잠깐 무적 점멸, 점수가 −500 반영, 몬스터 다시 움직임.
3. **부활(클릭)**: 클릭으로도 동일하게 부활.
4. **타임아웃**: 입력 없이 0까지 → 기존 GameOverScene(점수는 −500 반영된 값) 표시. 이때 화면에 낡은 HUD(목숨/점수)가 겹쳐 보이지 않아야 함.
5. **메뉴 복귀**: GameOverScene에서 클릭 → MenuScene으로 이동(스테이지 처음부터 재시작 X). 메뉴 위에 HUD 잔상 없어야 함. 메뉴에서 다시 Play 시 정상 시작.
6. **보스전 사망**: `MenuScene`의 보스 점프 단축키(주석 해제) 또는 디버그 URL로 진입 후 보스 탄환에 맞아 사망 → 동일한 Continue 흐름, 부활 시 보스 패턴 재개.
7. **연속 사망**: 부활 후 다시 죽어도 카운트다운 재등장, 점수가 추가로 −500(최소 0)인지 확인.
8. 콘솔 에러 없는지 확인(필요 시 Chrome DevTools MCP / `validate-ui`).

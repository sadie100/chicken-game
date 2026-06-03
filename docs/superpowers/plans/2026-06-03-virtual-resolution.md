# 가상 해상도 도입 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게임을 고정 가상 해상도 480×270으로 렌더한 뒤 통째로 확대해, 배경·캐릭터·보스의 도트 한 칸 크기를 통일한다.

**Architecture:** 저해상도 렌더 타깃 + 상수 재보정. config를 480×270 고정으로 바꾸고(`Scale.FIT` 레터박스), 배경을 1:1로 그리며, 모든 스프라이트를 정수 배율로 낮추고, 픽셀 단위 속도/오프셋/UI 크기를 작은 캔버스에 맞게 비례 축소한다. `scale.width/height` 상대 좌표는 자동으로 맞춰진다.

**Tech Stack:** Phaser 3, Vite. 테스트 스위트 없음 → 검증은 `npm run dev` + 디버그 진입(`?scene=...`) + 스크린샷/플레이.

**설계 문서:** [docs/superpowers/specs/2026-06-03-virtual-resolution-design.md](../specs/2026-06-03-virtual-resolution-design.md)

---

## 사전 준비 (모든 태스크 공통)

검증은 브라우저에서 한다. 한 번 띄워두고 재사용한다.

- 개발 서버: `npm run dev` (기본 `http://localhost:5173/chicken-game/`)
- 디버그 진입 URL:
    - 메뉴: `?scene=menu`
    - 1스테이지: `?scene=first`
    - 보스(아이템 만렙): `?scene=boss&items=max`
    - 게임오버: `?scene=GameOverScene`
    - 엔딩: `?scene=GameClearScene`

각 태스크의 검증 단계는 위 URL을 열어 **육안 확인**한다. 자동 테스트는 없다.

---

## File Structure

| 파일 | 책임 | 변경 |
| --- | --- | --- |
| [src/main.js](../../../src/main.js) | 게임 config / 렌더 타깃 | 해상도 고정, roundPixels 수정 |
| [src/backgrounds/Background.js](../../../src/backgrounds/Background.js) | 패럴럭스 배경 | 1:1 매핑 |
| [src/gameobjects/Player.js](../../../src/gameobjects/Player.js) | 플레이어 | setScale, 시작 x, speed, 알 속도 |
| [src/gameobjects/monsters/Pig.js](../../../src/gameobjects/monsters/Pig.js) | 돼지 | setScale |
| [src/gameobjects/monsters/Cat.js](../../../src/gameobjects/monsters/Cat.js) | 고양이 | setScale |
| [src/gameobjects/monsters/GoldPig.js](../../../src/gameobjects/monsters/GoldPig.js) | 보스 | setScale 상수화, 탄막/이동 속도·오프셋 |
| [src/scenes/NormalScene.js](../../../src/scenes/NormalScene.js) | 일반 스테이지 공통 | 몬스터 속도, next-arrow |
| [src/scenes/FirstScene.js](../../../src/scenes/FirstScene.js) | 1스테이지 | 스폰 속도 config |
| [src/scenes/SecondScene.js](../../../src/scenes/SecondScene.js) | 2스테이지 | 스폰 속도 config |
| [src/scenes/BaseScene.js](../../../src/scenes/BaseScene.js) | 게임플레이 공통 | 하트 스폰 여백 |
| [src/scenes/HudScene.js](../../../src/scenes/HudScene.js) | HUD | 폰트/아이콘/위치 크기 |

> 4.4의 속도/오프셋 값은 모두 **시작값**이다. Task 5(플레이테스트)에서 최종 튜닝한다.

---

## Task 1: 렌더 타깃 + 배경 1:1

**Files:**
- Modify: `src/main.js:21-27`
- Modify: `src/backgrounds/Background.js:25-42`

- [ ] **Step 1: config 해상도 고정 + roundPixels 오타 수정**

[src/main.js](../../../src/main.js) — 현재:

```js
    width: window.innerWidth,
    height: window.innerHeight,
    // width: 960,
    // height: 540,
    backgroundColor: "#1c172e",
    pixelArt: true,
    roundPixel: false,
```

변경 후:

```js
    width: 480,
    height: 270,
    backgroundColor: "#1c172e",
    pixelArt: true,
    roundPixels: true,
```

- [ ] **Step 2: 배경을 1:1로 그리기**

[src/backgrounds/Background.js](../../../src/backgrounds/Background.js) `createLayer` — 현재:

```js
    createLayer(key, scrollFactor, width, height) {
        const image = this.scene.textures.get(key);
        const sourceWidth = image.source[0].width;
        const sourceHeight = image.source[0].height;

        const scale = height / sourceHeight;

        const layer = this.scene.add.tileSprite(0, 0, width, height, key);
        layer.setOrigin(0, 0);
        layer.setScrollFactor(0);

        layer.setScale(scale);
        layer.tileScaleX = 1 / scale;
        layer.tileScaleY = 1;

        this.container.add(layer);
        this.layers.push({ sprite: layer, scrollFactor: scrollFactor });
    }
```

변경 후 (소스 픽셀 1칸 = 가상 픽셀 1칸; 사용하지 않게 된 `sourceWidth/sourceHeight/scale` 제거):

```js
    createLayer(key, scrollFactor, width, height) {
        const layer = this.scene.add.tileSprite(0, 0, width, height, key);
        layer.setOrigin(0, 0);
        layer.setScrollFactor(0);

        layer.setScale(1);
        layer.tileScaleX = 1;
        layer.tileScaleY = 1;

        this.container.add(layer);
        this.layers.push({ sprite: layer, scrollFactor: scrollFactor });
    }
```

- [ ] **Step 3: 검증 — 도트 통일 1차 확인**

`npm run dev` 실행 후 브라우저에서 확인:
- `?scene=first` — 배경 구름/풀의 도트 한 칸 크기가 **돼지·꼬꼬의 도트 한 칸과 비슷**한지. (이전엔 배경이 매끈하고 캐릭터만 굵었음)
- `?scene=boss&items=max` — 동굴 배경 도트가 캐릭터 도트와 비슷한지.
- `?scene=menu`, `?scene=GameOverScene`, `?scene=GameClearScene` — 깨짐/공백 없이 표시되는지.

이 단계에서 캐릭터/UI는 아직 크다(다음 태스크에서 보정). **배경 도트 굵기 통일**만 확인하면 성공.

기대: 배경이 캐릭터와 같은 "도트 굵기"로 보인다. 화면이 16:9 레터박스로 중앙 정렬된다.

- [ ] **Step 4: Commit**

```bash
git add src/main.js src/backgrounds/Background.js
git commit -m "feat: 가상 해상도 480x270 렌더 타깃 + 배경 1:1 매핑"
```

---

## Task 2: 스프라이트 표시 배율 재보정

**Files:**
- Modify: `src/gameobjects/Player.js:41`
- Modify: `src/gameobjects/monsters/Pig.js:7`
- Modify: `src/gameobjects/monsters/Cat.js:8`
- Modify: `src/gameobjects/monsters/GoldPig.js` (setScale 상수화 + ultimate)
- Modify: `src/scenes/NormalScene.js:79-83`

- [ ] **Step 1: 꼬꼬 배율 1배**

[src/gameobjects/Player.js:41](../../../src/gameobjects/Player.js#L41) — `this.setScale(3);` → `this.setScale(1);`

- [ ] **Step 2: 돼지 배율 1배**

[src/gameobjects/monsters/Pig.js:7](../../../src/gameobjects/monsters/Pig.js#L7) — `this.setScale(3); // Pig의 크기를 3배로 확대` → `this.setScale(1);`

- [ ] **Step 3: 고양이 배율 1배**

[src/gameobjects/monsters/Cat.js:8](../../../src/gameobjects/monsters/Cat.js#L8) — `this.setScale(4); // Cat의 크기를 4배로 확대` → `this.setScale(1);`

- [ ] **Step 4: 보스 배율 상수화**

[src/gameobjects/monsters/GoldPig.js](../../../src/gameobjects/monsters/GoldPig.js) 파일 상단(import 아래)에 상수 추가:

```js
const BOSS_BASE_SCALE = 4;
```

생성자 `this.setScale(10);` (12행) → `this.setScale(BOSS_BASE_SCALE);`

`ultimatePattern` 내 `executePattern` 의 펄스/복원 부분 — 현재:

```js
            this.scene.tweens.add({
                targets: this,
                scaleX: 5.5,
                scaleY: 5.5,
                duration: 500,
                yoyo: true,
                repeat: -1,
            });
```

변경 후:

```js
            this.scene.tweens.add({
                targets: this,
                scaleX: BOSS_BASE_SCALE * 0.55,
                scaleY: BOSS_BASE_SCALE * 0.55,
                duration: 500,
                yoyo: true,
                repeat: -1,
            });
```

그리고 같은 메서드 내 복원 `this.setScale(10);` → `this.setScale(BOSS_BASE_SCALE);`

- [ ] **Step 5: next-arrow 배율 1배**

[src/scenes/NormalScene.js:78-83](../../../src/scenes/NormalScene.js#L78-L83) `showNextRoundArrow` — 현재:

```js
        this.nextRoundArrow = this.add
            .image(this.scale.width - 50, this.scale.height / 2, "next-arrow")
            .setInteractive();
        this.nextRoundArrow.setScale(2);
```

변경 후:

```js
        this.nextRoundArrow = this.add
            .image(this.scale.width - 15, this.scale.height / 2, "next-arrow")
            .setInteractive();
        this.nextRoundArrow.setScale(1);
```

- [ ] **Step 6: 검증**

브라우저에서:
- `?scene=first` — 꼬꼬/돼지/고양이가 화면에 적당한 크기(꼬꼬 ≈ 화면 높이 18%)로 보이고, 도트 굵기가 배경과 통일됐는지. 화면 끝까지 걸어가면 next-arrow가 적당한 크기로 나오는지(스테이지 클리어까지 기다리거나 `stageTime` 임시 단축으로 확인).
- `?scene=boss&items=max` — 보스가 "큰 보스"로 보이되 화면을 벗어나지 않는지. 체력 절반 이하로 만들어 ultimate 펄스가 자연스러운지(아이템 만렙으로 빠르게 깎기).

기대: 모든 캐릭터가 배경과 같은 도트 굵기, 화면에 알맞은 크기.

- [ ] **Step 7: Commit**

```bash
git add src/gameobjects/Player.js src/gameobjects/monsters/Pig.js src/gameobjects/monsters/Cat.js src/gameobjects/monsters/GoldPig.js src/scenes/NormalScene.js
git commit -m "feat: 스프라이트 표시 배율 정수화(도트 통일)"
```

---

## Task 3: HUD/UI 크기 재보정

**Files:**
- Modify: `src/scenes/HudScene.js` (create, updateEffects, updateLives)

- [ ] **Step 1: 점수/시간/탄정보 텍스트 크기·위치**

[src/scenes/HudScene.js](../../../src/scenes/HudScene.js) `create` — 현재:

```js
        this.points_text = this.add.bitmapText(
            10,
            50,
            "pixelfont",
            `${t("hud.points")}:0000`,
            24
        );

        this.time_text = this.add.bitmapText(
            this.scale.width - 10,
            10,
            "pixelfont",
            `${t("hud.time")}: 00:00`,
            24
        );
        this.time_text.setOrigin(1, 0);

        this.bullet_info_text = this.add.text(
            this.scale.width - 10,
            this.scale.height - 10,
            "",
            { fontSize: 20 }
        );
        this.bullet_info_text.setOrigin(1, 1);
```

변경 후:

```js
        this.points_text = this.add.bitmapText(
            6,
            22,
            "pixelfont",
            `${t("hud.points")}:0000`,
            10
        );

        this.time_text = this.add.bitmapText(
            this.scale.width - 6,
            6,
            "pixelfont",
            `${t("hud.time")}: 00:00`,
            10
        );
        this.time_text.setOrigin(1, 0);

        this.bullet_info_text = this.add.text(
            this.scale.width - 6,
            this.scale.height - 6,
            "",
            { fontSize: 8 }
        );
        this.bullet_info_text.setOrigin(1, 1);
```

- [ ] **Step 2: 효과 표시(아이콘+텍스트) 크기·여백**

[src/scenes/HudScene.js](../../../src/scenes/HudScene.js) `updateEffects` 내 — 현재:

```js
        const marginRight = 10;
        const marginBottom = 10;
        const lineGap = 6;
        const iconBaseSize = 16; // 스프라이트 기본 프레임 크기
        const iconTarget = 24; // 표시 크기(px)
        const textStyle = { fontSize: 16, color: "#ffffff" };
```

변경 후:

```js
        const marginRight = 6;
        const marginBottom = 6;
        const lineGap = 3;
        const iconBaseSize = 16; // 스프라이트 기본 프레임 크기
        const iconTarget = 10; // 표시 크기(px)
        const textStyle = { fontSize: 8, color: "#ffffff" };
```

- [ ] **Step 3: 하트(life) 크기·간격**

[src/scenes/HudScene.js](../../../src/scenes/HudScene.js) `updateLives` — 현재:

```js
            for (let i = 0; i < lives; i++) {
                const life = this.add
                    .image(20 + i * 30, 25, "life")
                    .setScale(1.5);
                this.lives_group.add(life);
            }
```

변경 후:

```js
            for (let i = 0; i < lives; i++) {
                const life = this.add
                    .image(8 + i * 12, 10, "life")
                    .setScale(1);
                this.lives_group.add(life);
            }
```

- [ ] **Step 4: 검증**

브라우저 `?scene=first`:
- 좌상단 하트 5개가 겹치지 않고 한 줄에 들어오는지
- 좌상단 점수 / 우상단 시간 텍스트가 화면 안에 적당한 크기로 보이는지
- 우하단 효과 아이콘+텍스트가 화면을 넘지 않고 정렬되는지

기대: HUD가 화면 비율에 맞게 작아지고 정렬 유지. (작은 px의 일반 텍스트가 약간 흐릴 수 있음 — 폰트 통일 후속 작업 영역, 이번엔 크기만 확인)

- [ ] **Step 5: Commit**

```bash
git add src/scenes/HudScene.js
git commit -m "feat: HUD 폰트/아이콘/위치를 가상 해상도에 맞게 축소"
```

---

## Task 4: 월드 속도/오프셋 재보정 (시작값)

**Files:**
- Modify: `src/gameobjects/Player.js:22,27,36`
- Modify: `src/scenes/NormalScene.js:17-18`
- Modify: `src/scenes/FirstScene.js:17-18`
- Modify: `src/scenes/SecondScene.js:21-23`
- Modify: `src/scenes/BaseScene.js:297-298`
- Modify: `src/gameobjects/monsters/GoldPig.js` (탄막/이동 속도·오프셋)

> 계수 ≈ 0.4. 아래는 시작값이며 Task 5에서 튜닝한다.

- [ ] **Step 1: 플레이어 속도/시작 위치**

[src/gameobjects/Player.js](../../../src/gameobjects/Player.js):
- 22행 `speed = 200;` → `speed = 80;`
- 23행 `baseSpeed = 200;` → `baseSpeed = 80;`
- 26행 `baseBulletSpeed = 400;` → `baseBulletSpeed = 160;`
- 27행 `bulletSpeed = 400;` → `bulletSpeed = 160;`
- 36행 생성자 `super(scene, 100, scene.scale.height / 2, "chicken_idle");` → `super(scene, 30, scene.scale.height / 2, "chicken_idle");`

> 참고: `recomputeStatsFromEffects`는 `baseSpeed/baseBulletSpeed`에서 파생되므로 base만 바꾸면 효과 계산은 자동 반영된다. 효과 증분(`speed*50`, `eggSpeed*100`)은 Task 5에서 체감 보고 조정.

- [ ] **Step 2: NormalScene 기본 몬스터 속도**

[src/scenes/NormalScene.js:16-18](../../../src/scenes/NormalScene.js#L16-L18) — 현재:

```js
    initialMonsterSpeed = 200; // 최초 속도
    currentMonsterSpeed = 200; // 현재 속도
    monsterSpeedIncreaseRate = 5; // 몬스터 속도 증가 속도
```

변경 후:

```js
    initialMonsterSpeed = 80; // 최초 속도
    currentMonsterSpeed = 80; // 현재 속도
    monsterSpeedIncreaseRate = 2; // 몬스터 속도 증가 속도
```

- [ ] **Step 3: FirstScene 스폰 속도 config**

[src/scenes/FirstScene.js:17-18](../../../src/scenes/FirstScene.js#L17-L18) — 현재:

```js
            initialMonsterSpeed: 180, // 기본보다 약간 느리게 시작
            monsterSpeedIncreaseRate: 6,
```

변경 후:

```js
            initialMonsterSpeed: 72, // 기본보다 약간 느리게 시작
            monsterSpeedIncreaseRate: 2,
```

- [ ] **Step 4: SecondScene 스폰 속도 config**

[src/scenes/SecondScene.js:21-23](../../../src/scenes/SecondScene.js#L21-L23) — 현재:

```js
            initialMonsterSpeed: 200, // 약간 빠름
            monsterSpeedIncreaseRate: 5,
```

변경 후:

```js
            initialMonsterSpeed: 80, // 약간 빠름
            monsterSpeedIncreaseRate: 2,
```

- [ ] **Step 5: 하트 스폰 여백**

[src/scenes/BaseScene.js:297-298](../../../src/scenes/BaseScene.js#L297-L298) `spawnHeart` — 현재:

```js
            const x = Phaser.Math.Between(100, this.scale.width - 100);
            const y = Phaser.Math.Between(100, this.scale.height - 100);
```

변경 후:

```js
            const x = Phaser.Math.Between(30, this.scale.width - 30);
            const y = Phaser.Math.Between(30, this.scale.height - 30);
```

- [ ] **Step 6: 보스 탄막/이동 속도·오프셋·탄 크기**

[src/gameobjects/monsters/GoldPig.js](../../../src/gameobjects/monsters/GoldPig.js) 의 픽셀 단위 값들을 ×0.4로 축소하고 탄 크기를 1로 낮춘다. 정확한 치환:

**pattern1** (전진/움찔):
- `x: this.x + 20,` → `x: this.x + 8,`
- `x: 50,` → `x: 20,`

**pattern2** (상하 이동 + 5방향 탄):
- `bullet.setScale(2.5); // 크기 증가` → `bullet.setScale(1);`
- `bullet.fire(this.x, this.y, -500, i * 70);` → `bullet.fire(this.x, this.y, -200, i * 30);`
- `y: this.initialY - 100,` → `y: this.initialY - 40,`
- `y: this.initialY + 100,` → `y: this.initialY + 40,`

**pattern3** (다이아몬드 이동 + 조준 탄). diamondPoints 의 `-100` 오프셋과 탄 속도/크기:
- `y: this.scene.scale.height - 100,` → `y: this.scene.scale.height - 40,`
- `{ x: this.scene.scale.width * 0.75, y: 100 },` → `{ x: this.scene.scale.width * 0.75, y: 40 },`
- `{ x: this.scene.scale.width - 100, y: this.scene.scale.height / 2 },` → `{ x: this.scene.scale.width - 40, y: this.scene.scale.height / 2 },`
- 조준 탄: `bullet.setScale(2);` (fireAtPlayer 내) → `bullet.setScale(1);`
- `const velocityX = Math.cos(angle) * 350;` → `* 140;`
- `const velocityY = Math.sin(angle) * 350;` → `* 140;`
- 위 중앙 이동 `y: 100,` → `y: 40,`
- 다이아몬드 꼭짓점 탄막 4발: `bullet.setScale(2);` → `bullet.setScale(1);`
- `const velocityX = Math.cos(angle) * 300;` → `* 120;`
- `const velocityY = Math.sin(angle) * 300;` → `* 120;`

**ultimate** (회전 탄막):
- `const bulletSpeed = 350;` → `const bulletSpeed = 140;`
- `bullet.setScale(2);` → `bullet.setScale(1);`

**pattern4** (몬스터 소환):
- `const monster = new monsterType(this.scene, x, y, 500, direction);` → `..., 200, direction);`

> `this.scene.scale.width * 0.7/0.75/0.5` 같은 **비율 기반 값은 그대로 둔다**(자동 적응). 바꾸는 것은 절대 픽셀 값(±100, 350 등)뿐이다.

- [ ] **Step 7: 검증 (1차 플레이)**

브라우저:
- `?scene=first` — 직접 플레이. 꼬꼬 이동/알 발사/몬스터 접근 속도가 과하게 빠르거나 느리지 않은지 체감.
- `?scene=boss&items=max` — 보스 탄막이 화면 안에서 피할 수 있는 속도/밀도인지, 보스 이동(±40)이 화면을 벗어나지 않는지.

기대: 이전과 비슷한 게임 속도감. 어색하면 값 기록 후 Task 5에서 조정.

- [ ] **Step 8: Commit**

```bash
git add src/gameobjects/Player.js src/scenes/NormalScene.js src/scenes/FirstScene.js src/scenes/SecondScene.js src/scenes/BaseScene.js src/gameobjects/monsters/GoldPig.js
git commit -m "feat: 월드 속도/오프셋을 가상 해상도에 맞게 비례 축소(시작값)"
```

---

## Task 5: 플레이테스트 튜닝 & 최종 확인

**Files:** Task 1~4에서 만진 값 중 체감상 어색한 것만 미세조정.

- [ ] **Step 1: 전체 플로우 플레이**

`npm run dev` 후 `?scene=first` 부터 정상 플레이로 1스테이지 → 2스테이지 → 보스까지 진행(또는 각 씬 디버그 진입). 다음을 점검:
- 캐릭터/배경 도트 굵기 통일 (모든 씬)
- 게임 속도감 (이동/탄/몬스터)
- 보스 패턴이 화면 안에서 동작하고 회피 가능
- HUD 가독성/정렬
- 메뉴/게임오버/엔딩이 16:9 레터박스로 정상 표시

- [ ] **Step 2: 어색한 값 미세조정**

체감상 빠르면 Task 4 값을 더 낮추고, 작/크면 Task 2·3 배율을 ±1단계 조정. 한 번에 하나씩 바꾸고 즉시 확인(핫리로드). 조정한 파일만 기록.

- [ ] **Step 3: 5개 씬 스크린샷으로 최종 회귀 확인**

`?scene=menu` / `?scene=first` / `?scene=boss&items=max` / `?scene=GameOverScene` / `?scene=GameClearScene` 각각 스크린샷. 깨짐/공백/오버플로우 없는지 최종 확인.

- [ ] **Step 4: Commit (조정이 있었다면)**

```bash
git add -A
git commit -m "tune: 가상 해상도 전환 후 속도/크기 플레이테스트 튜닝"
```

---

## 완료 기준 (Definition of Done)

- [ ] 5개 씬 모두에서 배경 도트 ≈ 캐릭터 도트 (통일감 확보)
- [ ] 16:9 레터박스로 중앙 정렬되어 표시
- [ ] 게임 속도감이 플레이 가능한 수준 (과속/과둔 아님)
- [ ] 보스 패턴이 화면 안에서 동작 & 회피 가능
- [ ] HUD가 화면 안에 정렬되어 가독 (텍스트 흐림은 폰트 통일 후속으로 허용)
- [ ] `npm run build` 성공

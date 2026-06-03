# 그래픽 일관성 리뷰 #1 — 엔딩 폰트 통일

## Context

[docs/graphics-consistency-review.md](../../docs/graphics-consistency-review.md)의 개선 우선순위 #1은
"엔딩 스토리의 Arial을 픽셀 폰트로 교체"다. 도트 화면에 매끈한 고딕(Arial)이 끼어
가장 크게 깨지는 부분이라 효과가 크고 작업량이 적다고 분류돼 있었다.

**그러나 리뷰의 전제가 틀렸다.** 코드 확인 결과:

- 엔딩 스토리는 **한글**이다 ([ko.json `gameclear.story`](../../src/i18n/locales/ko.json)).
- 프로젝트의 유일한 픽셀 폰트 `pixelfont`는 비트맵 폰트이고 **ASCII(char 32~125)만** 들어 있다
  ([pixelfont.xml](../../public/assets/fonts/pixelfont.xml)). 한글 글리프가 없어 한글을 그릴 수 없다.
  (HUD·게임오버의 pixelfont 텍스트가 전부 영문/숫자인 이유다.)
- 게임오버 제목의 `fontFamily: "pixel"`은 `@font-face`/폰트 파일이 없어 **로드되지 않고 기본 폰트로 폴백** 중이다.
- [index.html](../../index.html)에 `font-family: DNFBitBitv2` preload용 숨은 div가 있으나 정의가 없어 **죽은 코드**다.

즉 현재 한글을 렌더링할 수 있는 픽셀 폰트가 아예 없다. 따라서 단순 교체가 아니라
**한글 픽셀 웹폰트를 새로 도입**해야 한다.

## 결정 사항 (사용자 확인 완료)

- 방향: 한글 픽셀 웹폰트 추가
- 폰트: **Galmuri (Galmuri11)** — jsDelivr CDN, OFL 라이선스, 한글 완전 지원. 파일 추가 불필요.
- 적용 범위: 이번엔 **엔딩만** (리뷰 #1). 게임오버 `"pixel"` / 메뉴 한글 통일은 후속.

## 변경 내용

### 1. [index.html](../../index.html)
- `<head>`에 Galmuri CDN 로드 추가:
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/galmuri/dist/galmuri.css">
  ```
- 기존 숨은 preload div의 `font-family: DNFBitBitv2`를 `font-family: Galmuri11`로 교체
  (브라우저가 폰트를 조기 다운로드하도록 유도하는 기존 패턴 재사용 — 죽은 DNFBitBitv2 대신 실제 쓰는 폰트로).

### 2. [src/scenes/GameClearScene.js](../../src/scenes/GameClearScene.js)
- 스토리 텍스트 스타일에서 `font: "32px Arial",` 한 줄을 아래로 교체:
  ```js
  fontFamily: "Galmuri11",
  fontSize: "32px",
  ```
- 나머지(`fill`, `align`, `wordWrap`, `backgroundColor`, `padding`, `width`)는 그대로 둔다.
  `this.add.text()`를 유지하므로 자동 줄바꿈·회색 배경박스·위로 스크롤하는 트윈이 모두 보존된다.

> 변경은 위 2개 파일뿐. 비동기 웹폰트 로딩 타이밍은 문제 없음 — 엔딩은 게임 맨 마지막(약 10분 후)
> 화면이라 그때면 폰트가 이미 로드돼 있다. 조기 preload div가 안전판 역할도 한다.

## 범위 밖 (이번에 건드리지 않음 — 후속 후보)

- 게임오버 제목 `fontFamily: "pixel"`이 폴백 중인 문제 ([GameOverScene.js:55](../../src/scenes/GameOverScene.js#L55)).
  같은 Galmuri로 통일하면 자연스럽지만 리뷰 #1 범위가 아니라 보류.
- 메뉴 한글 스토리의 기본 폰트 통일 ([MenuScene.js:138](../../src/scenes/MenuScene.js#L138)).

## 검증

1. `npm run dev` 실행.
2. 브라우저에서 `http://localhost:5173/chicken-game/?scene=GameClearScene` 진입.
3. 확인:
   - 한글 스토리가 **Galmuri 도트 폰트**로 렌더링된다 (Arial 매끈 고딕이 아님).
   - 회색 배경박스, 가운데 정렬, 자동 줄바꿈, 위로 올라가는 스크롤 트윈이 정상 동작.
   - "CLICK TO SKIP"(기존 pixelfont 영문)도 그대로 보임.
4. (선택) Chrome DevTools MCP로 스크린샷을 찍어 폰트가 도트체로 바뀐 것을 시각 확인.

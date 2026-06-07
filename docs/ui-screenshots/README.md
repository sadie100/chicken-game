# UI 스크린샷 (분석용)

UI 보완 작업을 위해 각 화면을 캡처한 모음. 캔버스 해상도 1280×720, 개발 서버에서 디버그 진입(`?scene=`)으로 촬영.

| 파일 | 화면 | 진입 방법 | 비고 |
| --- | --- | --- | --- |
| `01-menu.png` | 메뉴 (MenuScene) | `?scene=menu` | 로고, 게임 시작/설명, 언어 토글(KO) |
| `02-first-stage.png` | 1스테이지 (FirstScene) | `?scene=first` | 돼지만 등장, 상단 HUD(목숨/포인트/타임) |
| `03-second-stage.png` | 2스테이지 (SecondScene) | `?scene=second` | 돼지 + 고양이(30%) |
| `04-boss.png` | 보스전 (BossScene) | `?scene=boss` | GoldPig 등장, 상단 보스 체력바, 우하단 효과 HUD |
| `06-gameover.png` | 게임 오버 (GameOverScene) | `?scene=GameOverScene` | 배경 이미지 위치 이슈 보임(좌상단 정렬) |
| `07-gameclear.png` | 게임 클리어 (GameClearScene) | `?scene=GameClearScene` | 엔딩 스토리 스크롤 텍스트 |
| `08-continue.png` | 컨티뉴 (ContinueScene) | `?scene=boss&items=max` | 보스전 사망 직후 "계속하시겠습니까?" 오버레이 + 최대치 효과 HUD |

## 메모
- `04` / `08`은 같은 보스전에서 나온 화면이다. 플레이어가 가만히 있으면 보스 탄에 금방 죽어서, 빠르게 찍으면 깨끗한 보스 화면(`04`), 늦게 찍으면 컨티뉴 오버레이(`08`)가 잡힌다.
- 콘솔에 `background2_4`, `background4_*`, `background5_*` 이미지 로드 실패 에러가 있음(에셋 누락 추정). UI 보완과 별개로 확인 필요.
- `06-gameover.png`: 배경(`gameover` 이미지)이 `this.x/this.y`(undefined)로 배치돼 좌상단 일부만 그려지는 듯함. UI 보완 시 후보.

## 재촬영 방법
```bash
npm run dev   # http://localhost:5174/chicken-game/ (포트 사용 중이면 5173)
```
이후 `?scene=menu|first|second|boss|GameOverScene|GameClearScene` 로 접근해 캡처.

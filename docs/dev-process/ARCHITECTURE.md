# 랭킹보드 (Leaderboard) — 아키텍처 설계

## 1. 개요

| 항목 | 내용 |
|------|------|
| 기능명 | 랭킹보드 (Leaderboard) |
| 작성일 | 2026-06-09 |
| 기반 PRD | docs/dev-process/PRD-leaderboard.md |
| 상태 | Decided |

### 1.1 설계 목표
- **정적 배포 유지**: GitHub Pages 정적 배포(`dist`)를 변경 없이 그대로 두고, 브라우저가 런타임에 Supabase로 직접 점수를 read/write 한다. 별도 백엔드 서버 코드 없음.
- **공유 랭킹**: 모든 플레이어가 같은 Top N 보드를 본다.
- **게임 흐름 보호**: 네트워크/서비스 실패가 게임 진행을 막지 않는다(랭킹은 부가 기능).
- **순수 로직 분리**: 데이터 계층(`service`)과 판정 로직(`rules`)을 Phaser/DOM 의존 없이 분리해 단위 테스트 가능하게 한다.

### 1.2 제약 조건
- 기술적: GitHub Pages는 정적 파일만 서빙 → 런타임 쓰기는 외부 서비스(Supabase) 필수. Vite는 빌드 시점에 `import.meta.env.VITE_*`를 산출물에 인라인한다.
- 기술적: Phaser 3에는 텍스트 입력 위젯이 없다 → 이름 입력은 DOM으로 처리.
- 보안: anon 키는 `dist`에 공개로 포함되는 값. 보안은 RLS(행 수준 보안)로 건다. 클라이언트 전용 구조라 점수 위조는 원천 차단 불가(캐주얼 수준 수용, PRD Out of Scope).
- 기존: 테스트 러너 없음 → Vitest 신규 도입.

---

## 2. 기술 스택

| 레이어 | 기술 | 버전 | 비고 |
|--------|------|------|------|
| 게임 엔진 | Phaser | ^3.80.1 | 기존 |
| 번들러 | Vite | ^5.1.6 | 기존 |
| i18n | i18next | ^25.5.3 | 기존 (랭킹 라벨 추가) |
| 데이터 저장소 | Supabase (PostgREST + Postgres) | 무료 티어 | 신규 (외부 서비스) |
| 데이터 통신 | `fetch` (raw REST) | 내장 | 신규 의존성 0 |
| 이름 입력 | HTML `<input>` 오버레이 | 내장 DOM | 신규 |
| 테스트 | Vitest | 최신 | 신규 (devDependency) |
| CI/CD | GitHub Actions → Pages | 기존 | build 스텝에 env 주입만 추가 |

---

## 3. 시스템 구조

### 3.1 전체 구조도

```
                            [ 브라우저 (정적 dist, GitHub Pages) ]
  ┌──────────────────────────────────────────────────────────────────────┐
  │  MenuScene ──"랭킹"──┐                                                  │
  │  GameClearScene ─────┼──► LeaderboardPanel (UI, 재사용)                 │
  │  GameOverScene  ─────┘         ▲                                        │
  │        │                       │                                        │
  │        ▼                       │                                        │
  │  NameEntryDialog (UI, HTML input 오버레이)                              │
  │        │                       │                                        │
  │        ▼                       │                                        │
  │  rules.qualifiesForLeaderboard (순수 함수)                              │
  │        │                       │                                        │
  │        ▼                       ▼                                        │
  │  LeaderboardService  ── getTopScores / submitScore ──┐ (raw fetch)      │
  └──────────────────────────────────────────────────────┼─────────────────┘
                                                          │ HTTPS (REST)
                                                          ▼
                                       [ Supabase: PostgREST + Postgres ]
                                         · leaderboard 테이블
                                         · RLS: INSERT/SELECT 허용, UPDATE/DELETE 차단
                                         · CHECK: 0 ≤ score ≤ 상한
```

빌드/배포 경로는 **현재와 동일**하다. 유일한 추가는 빌드 스텝의 환경변수 주입.

```
push main → GitHub Actions → npm run build (env: VITE_SUPABASE_*) → upload dist → Pages 배포
```

### 3.2 컴포넌트 정의

#### LeaderboardService (데이터 계층, 깊은 모듈)
- **역할**: Supabase REST 호출을 캡슐화. 호출부는 Supabase/HTTP를 전혀 모른다.
- **입력**: `getTopScores(limit)` / `submitScore({ name, score, cleared })`
- **출력**: 정렬된 상위 N개 배열 / 등록 완료(또는 실패 throw)
- **위치**: `src/leaderboard/service.js`
- **내부**: `fetch`로 PostgREST 엔드포인트 호출. URL/anon 키는 config에서 주입. 에러는 호출부가 게임 흐름을 안 막도록 처리할 수 있는 형태로 전파.

#### qualifiesForLeaderboard (판정, 순수 함수)
- **역할**: 이 점수가 이름 입력 자격이 있는지 판단.
- **입력**: `(score, topScores, capacity)`
- **출력**: `boolean`
- **위치**: `src/leaderboard/rules.js`
- **규칙**: 보드가 `capacity` 미만이면 자격 있음. 가득 차면 `score`가 보드 최하위 점수보다 **클 때만** 자격(동점 진입 불가).

#### NameEntryDialog (UI)
- **역할**: 자격 통과 시 뜨는 이름 입력 오버레이. MenuScene 다이얼로그(크림 패널 + 골든 테두리 + 스크림) 스타일 재사용 + 중앙에 HTML `<input>` 오버레이.
- **입력**: 현재 점수, 콜백(`onSubmit(name)`, `onSkip`)
- **출력**: 트림된 이름 또는 건너뛰기
- **위치**: `src/gameobjects/NameEntryDialog.js`
- **내부**: `<input>`을 `#phaser-container`에 절대배치, 길이/문자 제한, 한글 IME는 브라우저에 위임.

#### LeaderboardPanel (UI, 재사용)
- **역할**: Top N 목록(순위·이름·점수, 클리어 표식 선택) 렌더링. MenuScene과 두 종료 씬에서 공용.
- **입력**: `topScores` 배열, 옵션(하이라이트할 내 기록, 로딩/에러 상태)
- **출력**: 표시 + 닫기 콜백
- **위치**: `src/gameobjects/LeaderboardPanel.js`
- **내부**: 로딩/에러 상태, 방금 등록 기록 하이라이트, `onLanguageChanged` 구독 → `shutdown`/닫기 시 해제(MenuScene 패턴).

#### config/leaderboard (설정)
- **역할**: 상수와 접속 정보 한 곳에 모음.
- **위치**: `src/config/leaderboard.js`
- **내용**: `TOP_N`(=10), `NAME_MAX_LEN`(=8), `MAX_PLAUSIBLE_SCORE`, 테이블명, `SUPABASE_URL`/`SUPABASE_ANON_KEY`(`import.meta.env.VITE_*`에서 읽음).

---

## 4. 데이터 흐름

### 4.1 주요 흐름: 게임 종료 → 등록 → 보드

```
1. GameClear/GameOver 진입 (data.points 보유)
2. LeaderboardService.getTopScores(TOP_N)  ──(한 번만 조회)
3. rules.qualifiesForLeaderboard(points, topScores, TOP_N)
   ├─ true  → NameEntryDialog 표시
   │           ├─ 등록: submitScore({name, score:points, cleared}) → LeaderboardPanel(내 기록 하이라이트)
   │           └─ 건너뛰기 → LeaderboardPanel(하이라이트 없음)
   └─ false → LeaderboardPanel(하이라이트 없음)
4. 닫기 → 기존 흐름(MenuScene 이동)
```

- 종료 씬에서 조회는 **한 번만** 수행하고, 그 결과를 판정과 패널에 함께 쓴다(중복 조회 방지).
- 네트워크/조회 실패 시: 자격 판정·보드 표시를 건너뛰고 **기존 종료 흐름을 그대로 진행**, 패널엔 "랭킹을 불러올 수 없어요" 안내. 게임은 절대 멈추지 않는다.
- GameClearScene은 엔딩 크레딧 스크롤 연출이 있으므로, 랭킹 표시는 **크레딧 종료 후** 단계에 끼운다(타이밍은 스펙에서 확정).

### 4.2 주요 흐름: 메뉴에서 보드 보기

```
1. MenuScene "랭킹" 버튼 클릭
2. LeaderboardService.getTopScores(TOP_N)
3. LeaderboardPanel 표시(로딩 → 결과 / 실패 시 에러)
4. 닫기 → 메뉴 복귀
```

### 4.3 REST 계약 (PostgREST)

공통 헤더: `apikey: <anon>`, `Authorization: Bearer <anon>`, `Content-Type: application/json`

- **조회**: `GET /rest/v1/leaderboard?select=name,score,cleared,created_at&order=score.desc,created_at.asc&limit=10`
- **등록**: `POST /rest/v1/leaderboard` body `{ name, score, cleared }`, 헤더 `Prefer: return=minimal`

### 4.4 데이터 모델

| 엔티티 | 설명 | 주요 필드 | 비고 |
|--------|------|----------|------|
| leaderboard | 랭킹 1행 = 1기록 | `id`(PK), `name`(text), `score`(int), `cleared`(bool), `created_at`(timestamptz) | 정렬: `score DESC, created_at ASC` |

스키마/정책 (스펙에서 SQL 확정):
- `score`: `CHECK (score >= 0 AND score <= MAX_PLAUSIBLE_SCORE)`
- `name`: `NOT NULL`, 길이 제한
- RLS: **활성화**. 정책 — anon **INSERT 허용**, **SELECT 허용**. UPDATE/DELETE 정책 미정의 → 기본 거부.

---

## 5. 설계 결정 기록 (ADR)

### ADR-01: 데이터 저장소로 Supabase + 정적 배포 유지
- **상태**: Decided
- **맥락**: 정적 GitHub Pages는 런타임 쓰기가 불가. 공유 랭킹은 외부 쓰기 가능 저장소 필요.
- **옵션**:
  - A) Supabase(BaaS) — 서버리스, RLS로 통제, 무료 / 점수 위조는 못 막음
  - B) GitHub 파일·액션·아티팩트 — 추가 인프라 없음 / 토큰 노출 위험, 재배포 지연(1~3분), 쓰기 충돌 → 부적합
  - C) localStorage 로컬 보드 — 인프라 0 / 공유 불가
- **결정**: A) Supabase
- **근거**: 공유 랭킹을 원하면 Supabase가 가장 가벼우면서 안전한 선택. Pages 워크플로를 건드리지 않고 클라이언트 직접 호출로 충족.

### ADR-02: Supabase 통신은 raw fetch (SDK 미사용)
- **상태**: Decided
- **맥락**: 필요한 연산은 INSERT 1 + SELECT topN 1, 단 둘뿐.
- **옵션**:
  - A) raw fetch — 의존성 0, 번들 +0KB, fetch 모킹으로 테스트 용이 / 헤더·쿼리 수동 작성
  - B) `@supabase/supabase-js` — 편의 / 번들 +50~100KB, realtime/auth 미사용
- **결정**: A) raw fetch
- **근거**: 두 개의 단순 호출에 수십 KB SDK는 과함. 테스트도 global fetch 모킹으로 단순해짐.

### ADR-03: 환경변수는 GitHub Actions Secrets로 빌드 시 주입
- **상태**: Decided
- **맥락**: Vite는 `VITE_*`를 빌드 시 인라인. anon 키는 어차피 dist에 공개로 포함됨.
- **옵션**:
  - A) Actions Secrets → build 스텝 env / 소스에 키 안 남김, 키 교체 쉬움
  - B) 소스에 하드코딩 / 가장 단순하나 교체 시 커밋 필요, 소스에 키 노출
- **결정**: A) Actions Secrets
- **근거**: 공개 값이라도 소스 분리·교체 용이성 이점이 크고 비용이 낮음. 로컬은 `.env`(gitignore).

### ADR-04: 이름 입력은 HTML `<input>` 오버레이
- **상태**: Decided
- **맥락**: Phaser엔 입력 위젯 없음. 이름에 한글이 들어가므로 IME 조합 입력 필수.
- **옵션**:
  - A) HTML `<input>` 오버레이 — IME·모바일 키보드·복붙 전부 브라우저 기본 / Scale.FIT 좌표 맞춤 필요
  - B) Phaser 자체 구현 — 비주얼 일치 / 한글 IME·모바일 키보드 처리 매우 어려움
  - C) rex InputText 플러그인 — A 장점 + Phaser 통합 / 플러그인 의존성 추가
- **결정**: A) HTML `<input>` 오버레이
- **근거**: 한글 입력 안정성이 최우선. 의존성 없이 IME를 브라우저에 위임하는 게 가장 견고.

### ADR-05: 점수 상한은 DB CHECK 제약으로 가볍게
- **상태**: Decided
- **맥락**: 클라이언트 전용이라 정교한 anti-cheat는 불가/과함. 다만 명백한 장난은 막고 싶음.
- **옵션**:
  - A) `CHECK (0 ≤ score ≤ 상한)` / 비용 0, 명백한 위조만 차단
  - B) 없음 / 가장 단순, 모든 값 허용
- **결정**: A) DB CHECK
- **근거**: 비용 거의 0으로 999999 류의 성의 없는 위조를 거름. 정교한 위조 차단은 비목표.

### ADR-06: 테스트는 Vitest, 순수 로직만
- **상태**: Decided
- **맥락**: 테스트 러너 없음. UI/Phaser 씬은 자동 테스트가 어려움.
- **결정**: Vitest 도입, `service`(fetch 모킹)·`rules`(순수)만 단위 테스트. UI는 수동 검증.
- **근거**: 외부 동작만 검증. Phaser/DOM 의존을 모듈에서 분리해 테스트 가능성을 확보.

---

## 6. 기존 시스템 영향

### 6.1 수정이 필요한 기존 코드

| 파일/모듈 | 변경 내용 | 영향 범위 |
|----------|----------|----------|
| `src/scenes/GameClearScene.js` | 크레딧 후 조회→자격판정→이름입력→보드 흐름 삽입 | 게임 클리어 종료 흐름 |
| `src/scenes/GameOverScene.js` | 점수 표시 후 동일 랭킹 흐름 삽입 | 게임오버 종료 흐름 |
| `src/scenes/MenuScene.js` | "랭킹" 버튼 추가 → LeaderboardPanel 표시 | 메인 메뉴 |
| `src/i18n/locales/ko.json`, `en.json` | 랭킹 라벨(제목/순위/이름/점수/등록/건너뛰기/로딩/에러/표식) 추가 | 다국어 |
| `.github/workflows/build.yml` | build 스텝에 `VITE_SUPABASE_*` env 주입 | 배포 |
| `package.json` | `vitest` devDependency + `test` 스크립트 | 빌드/개발 |
| `.gitignore` | `.env` 추가 | 로컬 개발 |

### 6.2 새로 생성할 파일/모듈

```
src/
  config/
    leaderboard.js          # 상수 + Supabase 접속 정보(import.meta.env)
  leaderboard/
    service.js              # LeaderboardService (raw fetch)
    service.test.js         # fetch 모킹 단위 테스트
    rules.js               # qualifiesForLeaderboard (순수)
    rules.test.js          # 순수 함수 단위 테스트
  gameobjects/
    NameEntryDialog.js     # HTML input 오버레이
    LeaderboardPanel.js    # Top N 뷰 (재사용)
.env.example               # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 예시
vitest.config.js           # (필요 시) 테스트 설정
docs/dev-process/
  supabase-setup.sql       # 테이블 + RLS + CHECK SQL (재현용)
```

---

## 7. 비기능 고려사항

| 항목 | 전략 | 비고 |
|------|------|------|
| 성능 | 종료 씬당 조회 1회, Top N(=10)만 fetch | 페이로드 작음 |
| 가용성 | 랭킹 실패가 게임을 막지 않음(흐름 분리 + 에러 안내) | 핵심 원칙 |
| 보안 | RLS로 INSERT/SELECT만 허용, UPDATE/DELETE 차단; CHECK로 상한 | anon 키 공개 전제 |
| 위조 내성 | 명백한 상한 위조만 차단(수용된 한계) | PRD Out of Scope |
| 국제화 | 모든 라벨 `t()`, 언어 전환 시 패널 즉시 갱신 후 구독 해제 | MenuScene 패턴 |
| 입력 호환 | HTML input으로 한글 IME·모바일 키보드 지원 | Scale.FIT 좌표 보정 필요 |

---

## 8. 미결 사항 (→ /dev-spec 에서 확정)

| 항목 | 상태 | 비고 |
|------|------|------|
| 수치 파라미터 확정 | Open | TOP_N=10, NAME_MAX_LEN=8, MAX_PLAUSIBLE_SCORE 산정 |
| 이름 허용 문자/공백 처리 | Open | 트림, 빈 이름 시 기본값/거부 |
| HTML input의 Scale.FIT 좌표 보정 방식 | Open | 캔버스 스케일에 맞춘 절대배치 |
| GameClearScene 크레딧 연출과 랭킹 표시 순서/타이밍 | Open | 크레딧 후 표시 가정 |
| `service` 실패 시 반환 계약 | Open | throw vs 빈 배열/에러 객체 |
| Supabase 테이블 SQL 최종본 | Open | supabase-setup.sql 작성 |
| 클리어/게임오버 기록 시각 구분 표식 노출 여부 | Open | PRD User Story 11(선택) |

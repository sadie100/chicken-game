# 랭킹보드 (Leaderboard) — 구현 스펙

## 1. 개요

| 항목 | 내용 |
|------|------|
| 기능명 | 랭킹보드 (Leaderboard) |
| 작성일 | 2026-06-09 |
| 기반 문서 | PRD-leaderboard.md, ARCHITECTURE.md |
| 상태 | Confirmed |

### 확정 파라미터

| 상수 | 값 | 비고 |
|------|----|----|
| `TOP_N` | 10 | 보드 크기 = 자격 판정 capacity |
| `NAME_MAX_LEN` | 8 | 트림 후 길이. 문자종류 제한 없음(길이만 검증) |
| `MAX_PLAUSIBLE_SCORE` | 100000 | 점수 +10/명중, 10분 풀플레이 이론상 ~3만 → 100k는 정상 플레이 미저촉 |
| `TABLE` | `leaderboard` | Supabase 테이블명 |

---

## 2. 구현 단위 목록

| 순서 | 단위명 | 설명 | 의존성 |
|------|--------|------|--------|
| 1 | Supabase 스키마/RLS | 테이블 + RLS + CHECK SQL (`supabase-setup.sql`) | 없음 |
| 2 | 테스트 인프라 | Vitest 도입, `test` 스크립트 | 없음 |
| 3 | config/leaderboard | 상수 + env 접속정보 | 없음 |
| 4 | i18n 라벨 | ko/en 랭킹 문자열 | 없음 |
| 5 | rules (순수) | `qualifiesForLeaderboard` + 테스트 | #3 |
| 6 | service (fetch) | `getTopScores`/`submitScore` + 테스트 | #3 |
| 7 | LeaderboardPanel | Top N 뷰 (재사용) | #4 |
| 8 | NameEntryDialog | HTML input 오버레이 | #4 |
| 9 | presentLeaderboard | 종료 씬 공용 흐름 오케스트레이션 | #5,#6,#7,#8 |
| 10 | MenuScene 통합 | "랭킹" 버튼 → 패널 | #6,#7 |
| 11 | 종료 씬 통합 | GameClear/GameOver에 흐름 삽입 | #9 |
| 12 | 배포 env 주입 | build.yml + .env.example + .gitignore | #3 |

---

## 3. 상세 스펙

### 3.1 Supabase 스키마/RLS (`docs/dev-process/supabase-setup.sql`)

#### 기능 설명
랭킹 데이터를 저장할 단일 테이블과 보안 정책을 정의한다. 재현 가능하도록 SQL로 문서화한다.

#### SQL
```sql
create table public.leaderboard (
  id         bigint generated always as identity primary key,
  name       text    not null check (char_length(trim(name)) between 1 and 8),
  score      integer not null check (score >= 0 and score <= 100000),
  cleared    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

create policy "anon can read"   on public.leaderboard for select to anon using (true);
create policy "anon can insert" on public.leaderboard for insert to anon with check (true);
-- UPDATE/DELETE 정책 없음 → 기본 거부

create index leaderboard_rank_idx on public.leaderboard (score desc, created_at asc);
```

#### 비즈니스 규칙
- **BR-01**: UPDATE/DELETE 정책을 정의하지 않아 anon 키로는 수정·삭제 불가. (보드 통째 삭제 방지)
- **BR-02**: `score`는 `0 ≤ score ≤ 100000` CHECK 위반 시 DB가 INSERT 거부. (명백한 위조 차단)
- **BR-03**: `name`은 트림 후 1~8자 CHECK. 클라이언트 검증과 이중화.

#### 인수 조건
```gherkin
AC-01: 정상 등록
Given RLS와 정책이 적용된 leaderboard 테이블
When anon 키로 {name:"꼬꼬", score:1200, cleared:true} INSERT
Then 1행이 저장된다

AC-02: 상한 초과 거부
Given 동일 테이블
When anon 키로 score:999999 INSERT
Then CHECK 위반으로 거부된다 (HTTP 4xx)

AC-03: 삭제 차단
Given 동일 테이블
When anon 키로 DELETE 시도
Then 정책 부재로 거부된다 (0행 영향)
```

---

### 3.2 테스트 인프라 (Vitest)

#### 기능 설명
순수 모듈 단위 테스트용 Vitest 도입. UI/Phaser는 대상 외.

#### 구현
- `package.json` devDependency에 `vitest` 추가, `"scripts"`에 `"test": "vitest run"`, `"test:watch": "vitest"` 추가.
- 환경은 기본 `node`(rules·service 모두 DOM 불필요). service 테스트는 `global.fetch`를 모킹.
- 테스트 파일은 대상 모듈과 코로케이션(`*.test.js`).

#### 인수 조건
```gherkin
AC-01: 테스트 실행
Given vitest 설치 완료
When `npm run test` 실행
Then rules/service 테스트가 수집·실행되고 결과를 보고한다
```

---

### 3.3 config/leaderboard (`src/config/leaderboard.js`)

#### 기능 설명
상수와 Supabase 접속정보를 한 곳에 모은다.

#### 인터페이스
```
TOP_N = 10
NAME_MAX_LEN = 8
MAX_PLAUSIBLE_SCORE = 100000
TABLE = "leaderboard"
SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
isConfigured() → boolean   // URL과 KEY가 모두 존재하면 true
```

#### 비즈니스 규칙
- **BR-01**: `isConfigured()`가 false면(예: 로컬에 .env 없음) 랭킹 기능은 "사용 불가"로 동작한다 — service는 호출 시 `LB_UNAVAILABLE`로 throw하고, UI는 에러 안내를 보이거나 흐름을 건너뛴다. 게임은 멈추지 않는다.

---

### 3.4 rules — `qualifiesForLeaderboard` (`src/leaderboard/rules.js`)

#### 기능 설명
이 점수가 이름 입력 자격이 있는지 판단하는 순수 함수.

#### 인터페이스
```
qualifiesForLeaderboard(score, topScores, capacity = TOP_N) → boolean
```
- `topScores`: 보드 기록 배열(각 항목에 `score` 보유). 정렬 여부에 의존하지 않는다.

#### 비즈니스 규칙
- **BR-01**: `score <= 0`이면 무조건 `false`. (0점 등록 방지)
- **BR-02**: `topScores.length < capacity`이면 `true`. (보드에 빈자리 있음)
- **BR-03**: 보드가 가득 차면(`length >= capacity`), `score > Math.min(...topScores.map(r => r.score))`일 때만 `true`. (최하위 점수 **초과**만 진입, 동점 진입 불가)

#### 인수 조건
```gherkin
AC-01: 빈 보드
Given topScores = [], capacity = 10
When qualifiesForLeaderboard(10, [], 10)
Then true

AC-02: 자리 남음
Given 기록 3개, capacity = 10
When qualifiesForLeaderboard(5, [{score:100},{score:50},{score:10}], 10)
Then true   // 점수가 낮아도 빈자리가 있으면 진입

AC-03: 가득 참 + 최하위 초과
Given 가득 찬 보드(최하위 100), capacity = 3
When qualifiesForLeaderboard(101, [{score:300},{score:200},{score:100}], 3)
Then true

AC-04: 가득 참 + 최하위 동점
Given 위와 동일
When qualifiesForLeaderboard(100, [...], 3)
Then false   // 동점은 진입 불가

AC-05: 0점/음수
Given 빈 보드
When qualifiesForLeaderboard(0, [], 10)
Then false
```

---

### 3.5 service — `LeaderboardService` (`src/leaderboard/service.js`)

#### 기능 설명
Supabase PostgREST에 raw `fetch`로 read/write. 호출부는 HTTP를 모른다.

#### 인터페이스
```
getTopScores(limit = TOP_N) → Promise<Array<{name, score, cleared, created_at}>>
submitScore({ name, score, cleared }) → Promise<void>
```

#### API 명세

공통 헤더: `apikey: <ANON>`, `Authorization: Bearer <ANON>`, `Content-Type: application/json`

**조회**
```
GET {SUPABASE_URL}/rest/v1/leaderboard?select=name,score,cleared,created_at&order=score.desc,created_at.asc&limit=10
```
Response (성공) 200:
```json
[{ "name": "꼬꼬", "score": 1200, "cleared": true, "created_at": "2026-06-09T..." }]
```

**등록**
```
POST {SUPABASE_URL}/rest/v1/leaderboard
Prefer: return=minimal
```
Request:
```json
{ "name": "꼬꼬", "score": 1200, "cleared": false }
```
Response (성공) 201: 본문 없음

**Response (실패)**

| 조건 | 처리 | throw |
|------|------|-------|
| `isConfigured()==false` | 호출 즉시 실패 | `Error("LB_UNAVAILABLE")` |
| 네트워크 오류 / fetch reject | 조회 실패 | `Error("LB_FETCH_FAILED")` (조회) / `Error("LB_SUBMIT_FAILED")` (등록) |
| HTTP !ok (4xx/5xx) | 위와 동일 코드로 throw | 동일 |

#### 비즈니스 규칙
- **BR-01**: 두 메서드 모두 실패 시 **reject(throw)** 한다. 반환값으로 에러를 숨기지 않는다(호출부가 try/catch로 처리).
- **BR-02**: `submitScore`는 받은 값을 그대로 전송한다(정제는 호출부/Dialog 책임). DB CHECK가 최종 방어선.
- **BR-03**: `getTopScores`는 PostgREST가 정렬해 반환한 배열을 그대로 반환한다(클라이언트 재정렬 안 함).

#### 인수 조건
```gherkin
AC-01: 조회 성공
Given fetch가 200과 정렬된 배열을 반환하도록 모킹
When getTopScores(10)
Then 올바른 URL(order=score.desc,created_at.asc&limit=10)로 호출하고 배열을 반환

AC-02: 조회 실패
Given fetch가 500을 반환
When getTopScores()
Then Error("LB_FETCH_FAILED") reject

AC-03: 등록 성공
Given fetch가 201 반환하도록 모킹
When submitScore({name:"꼬꼬", score:1200, cleared:false})
Then POST /rest/v1/leaderboard 에 올바른 헤더/바디로 1회 호출

AC-04: 미설정
Given isConfigured()==false
When getTopScores() 또는 submitScore(...)
Then Error("LB_UNAVAILABLE") reject (fetch 미호출)
```

---

### 3.6 LeaderboardPanel (`src/gameobjects/LeaderboardPanel.js`)

#### 기능 설명
Top N 목록을 렌더링하는 재사용 UI. MenuScene·종료 씬 공용. **데이터 fetch는 하지 않는다** — 씬이 service로 조회해 패널에 주입.

#### 인터페이스
```
new LeaderboardPanel({ scene, onClose })
panel.setLoading()
panel.setScores(topScores, { highlight })   // highlight: 강조할 기록(없으면 생략)
panel.setError()
panel.destroy()
```
- `highlight`: 방금 등록한 기록을 식별하기 위한 객체(`{name, score, created_at}`). 일치하는 첫 행을 강조.

#### UI 동작

| 상태 | 화면 표시 | 사용자 행동 |
|------|----------|------------|
| 로딩 | 패널 + "불러오는 중…" | 닫기만 가능 |
| 성공(목록) | 순위·이름·점수, 클리어 기록에 👑, 강조행 하이라이트 | 닫기 |
| 성공(빈 보드) | "아직 기록이 없어요" | 닫기 |
| 에러 | "랭킹을 불러올 수 없어요" | 닫기 |

#### 비즈니스 규칙
- **BR-01**: 각 행은 `순위. 이름  점수  [👑]` 형식. `cleared===true`인 기록에만 👑.
- **BR-02**: 스타일은 MenuScene 다이얼로그(크림 패널 + 골든 테두리 + 스크림) 재사용. 스크림/닫기 버튼으로 닫는다.
- **BR-03**: `onLanguageChanged` 구독으로 라벨 즉시 갱신, `destroy`/닫기 시 구독 해제(MenuScene 패턴 준수).
- **BR-04**: 점수는 천단위 표기 없이 정수 그대로(게임 HUD와 일관).

#### 인수 조건
```gherkin
AC-01: 목록 렌더
Given setScores([{name:"꼬꼬",score:1200,cleared:true}, ...])
When 패널 표시
Then 1위에 "1. 꼬꼬 1200 👑" 표시

AC-02: 빈 보드
Given setScores([])
Then "아직 기록이 없어요" 안내

AC-03: 강조
Given setScores(list, {highlight:{name:"꼬꼬",score:1200,created_at:X}})
Then 해당 행이 시각적으로 강조된다

AC-04: 언어 전환
Given 패널이 열린 상태
When 언어를 EN으로 전환
Then 제목/안내/표식 라벨이 즉시 영어로 바뀐다
```

---

### 3.7 NameEntryDialog (`src/gameobjects/NameEntryDialog.js`)

#### 기능 설명
자격 통과 시 뜨는 이름 입력 오버레이. 크림 패널 + 중앙 HTML `<input>`.

#### 인터페이스
```
new NameEntryDialog({ scene, score, onSubmit, onSkip })
// onSubmit(name: string)  // 트림된 이름
// onSkip()
dialog.destroy()
```

#### UI 동작

| 상태 | 화면 표시 | 사용자 행동 |
|------|----------|------------|
| 기본 | "신기록! 이름을 입력하세요" + 점수 + input + [등록][건너뛰기] | 입력/등록/건너뛰기 |
| 빈 이름 | 등록 버튼 비활성 | 건너뛰기는 가능 |

#### 데이터 유효성 검증

| 필드 | 타입 | 필수 | 규칙 | 처리 |
|------|------|------|------|------|
| name | string | Y | 트림 후 1~`NAME_MAX_LEN`(8)자, 문자종류 제한 없음 | 트림 결과 길이 0이면 등록 비활성. input `maxlength=8` |

#### 비즈니스 규칙
- **BR-01**: `<input>`은 `#phaser-container`에 절대배치로 추가하고, 다이얼로그 종료 시 **반드시 DOM에서 제거**한다.
- **BR-02**: 입력값은 `maxlength=8`로 길이 제한, 제출 시 `trim()` 적용. 트림 후 빈 문자열이면 제출 불가(이름 필수).
- **BR-03**: 한글 IME 조합 입력은 브라우저 `<input>`에 위임한다(별도 처리 없음).
- **BR-04**: Enter 키 = 등록(유효할 때), Esc = 건너뛰기.
- **BR-05**: Scale.FIT으로 캔버스가 중앙 정렬되므로 input도 컨테이너 중앙에 CSS로 고정(리사이즈 시 재계산 불필요).

#### 인수 조건
```gherkin
AC-01: 정상 등록
Given 다이얼로그 표시
When "꼬꼬" 입력 후 등록
Then onSubmit("꼬꼬") 호출, input DOM 제거

AC-02: 공백 이름
When "   " 입력
Then 등록 버튼 비활성 상태 유지

AC-03: 건너뛰기
When 건너뛰기 클릭(또는 Esc)
Then onSkip() 호출, input DOM 제거

AC-04: 길이 제한
When 9자 이상 입력 시도
Then 8자에서 더 입력되지 않음
```

---

### 3.8 presentLeaderboard — 종료 씬 공용 흐름 (`src/leaderboard/presentLeaderboard.js`)

#### 기능 설명
GameClear/GameOver가 공유하는 "조회→자격판정→이름입력→등록→보드" 오케스트레이션. UI 조정이라 자동 테스트 대상 외(수동 검증).

#### 인터페이스
```
presentLeaderboard(scene, { score, cleared, onDone })
```

#### 흐름
```
1. panel = LeaderboardPanel(scene); panel.setLoading()
2. try topScores = await getTopScores(TOP_N)
   catch → panel.setError(); (사용자 닫기) → onDone(); return
3. qualifies = qualifiesForLeaderboard(score, topScores, TOP_N)
4. if qualifies:
     NameEntryDialog 표시
       - onSubmit(name):
           try await submitScore({name, score, cleared})
                refreshed = await getTopScores(TOP_N)
                panel.setScores(refreshed, { highlight:{name, score} })
           catch → panel.setScores(topScores) + 등록 실패 안내(인라인/토스트)
       - onSkip(): panel.setScores(topScores)
   else:
     panel.setScores(topScores)
5. panel 닫기 → onDone()
```

#### 비즈니스 규칙
- **BR-01**: 어떤 실패가 나도 결국 `onDone()`이 호출되어 기존 종료 흐름(메뉴 이동)이 보장된다. 게임은 멈추지 않는다.
- **BR-02**: 등록 후 재조회해 강조 표시한다(낙관적 삽입 대신 실제 저장 결과 반영).
- **BR-03**: 등록 실패 시 점수는 잃지만 흐름은 진행하고, 보드는 기존 조회 결과로 표시한다.

#### 인수 조건
```gherkin
AC-01: 자격 + 등록
Given score가 Top10 진입
When 흐름 실행, 이름 등록
Then submitScore 호출 후 재조회된 보드에 내 기록이 강조

AC-02: 미자격
Given score가 Top10 미달(가득 찬 보드)
When 흐름 실행
Then 이름 입력 없이 바로 보드 표시 → 닫으면 onDone

AC-03: 조회 실패
Given getTopScores가 throw
When 흐름 실행
Then 에러 패널 표시, 닫으면 onDone (게임 흐름 유지)

AC-04: 등록 실패
Given submitScore가 throw
When 이름 등록 시도
Then 실패 안내 + 기존 보드 표시, onDone 도달
```

---

### 3.9 MenuScene 통합 (`src/scenes/MenuScene.js`)

#### 기능 설명
기존 Play/Help 버튼과 같은 `Button`으로 "랭킹" 버튼 추가.

#### 비즈니스 규칙
- **BR-01**: "랭킹" 클릭 → `LeaderboardPanel` 생성 + `setLoading()` → `getTopScores` → `setScores`/`setError`.
- **BR-02**: 버튼 라벨/패널 라벨은 `t()` 사용, 언어 전환 시 갱신(`refreshTexts`에 합류).
- **BR-03**: 버튼 배치는 기존 레이아웃(Play 아래 Help)과 충돌하지 않게 추가(위치는 구현 시 조정).

#### 인수 조건
```gherkin
AC-01: 보드 열기
Given 메뉴 화면
When "랭킹" 버튼 클릭
Then 로딩 후 Top10 목록(또는 에러) 표시

AC-02: 닫기
When 패널 닫기
Then 메뉴로 복귀, 구독 해제
```

---

### 3.10 종료 씬 통합 (`GameClearScene.js`, `GameOverScene.js`)

#### 기능 설명
두 종료 씬에 `presentLeaderboard`를 삽입한다.

#### 비즈니스 규칙
- **BR-01 (GameClear)**: `cleared = true`. 엔딩 크레딧 스크롤 **완료 후** `presentLeaderboard` 호출, `onDone`에서 기존처럼 `MenuScene` 이동.
- **BR-02 (GameClear)**: 크레딧 중 화면 클릭(현재 즉시 리셋) 시에도 랭킹을 건너뛰지 않고 `presentLeaderboard`로 진입한다(크레딧만 스킵).
- **BR-03 (GameOver)**: `cleared = false`. 기존 GAME OVER 패널/점수를 먼저 보여주고, "MENU" 버튼 또는 화면 클릭 시 `presentLeaderboard` 호출 → `onDone`에서 `MenuScene` 이동.
- **BR-04**: `score = data.points`(이미 두 씬이 보유). 추가 집계 없음.

#### 인수 조건
```gherkin
AC-01: 클리어 후 랭킹
Given 보스 처치로 GameClearScene 진입(points=N)
When 크레딧 종료(또는 스킵)
Then cleared=true로 presentLeaderboard 실행 후 메뉴 이동

AC-02: 게임오버 후 랭킹
Given GameOverScene 진입(points=N)
When MENU/클릭으로 진행
Then cleared=false로 presentLeaderboard 실행 후 메뉴 이동
```

---

### 3.11 배포 env 주입 (`.github/workflows/build.yml`, `.env.example`, `.gitignore`)

#### 기능 설명
정적 빌드에 Supabase 접속정보를 빌드 시점에 주입한다.

#### 구현
- `build.yml`의 Build 스텝에 env 추가:
  ```yaml
  - name: Build
    run: npm run build
    env:
      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  ```
- GitHub repo Settings → Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록(수동, 사전 작업).
- `.env.example` 생성(값 없이 키만), `.gitignore`에 `.env` 추가. 로컬 개발은 `.env` 사용.

#### 비즈니스 규칙
- **BR-01**: Secrets 미설정 상태로 빌드되면 `isConfigured()==false`가 되어 랭킹은 비활성 동작(게임 정상). 배포가 깨지지 않는다.

#### 인수 조건
```gherkin
AC-01: Secrets 주입
Given repo Secrets에 두 값 등록
When main 푸시로 Actions 빌드
Then dist에 값이 인라인되어 랭킹 동작

AC-02: 미설정 안전성
Given Secrets 미등록
When 빌드/배포
Then 게임은 정상 동작, 랭킹만 "사용 불가"
```

---

## 4. 공통 사항

### 4.1 에러 처리 전략
- service는 실패 시 `LB_UNAVAILABLE`/`LB_FETCH_FAILED`/`LB_SUBMIT_FAILED`로 throw.
- UI는 모두 try/catch로 받아 **게임 흐름을 막지 않고** 에러 안내(패널/인라인)만 표시.
- 종료 씬은 어떤 경우에도 `onDone()`에 도달 → 메뉴 이동 보장.

### 4.2 로깅/모니터링
- 기존 컨벤션상 `console.log` 수준. service 실패 시 `console.warn`으로 코드/원인 1줄 기록. 외부 모니터링 도입 없음.

### 4.3 마이그레이션
- `supabase-setup.sql` 1회 실행으로 테이블/정책/인덱스 생성. 기존 데이터 마이그레이션 없음(신규 테이블).

---

## 5. 구현 체크리스트

- [ ] #1 Supabase: 테이블+RLS+CHECK 생성, anon insert/select 동작·삭제 차단 확인
- [ ] #2 Vitest: `npm run test` 동작
- [ ] #3 config/leaderboard: 상수 + `isConfigured()`
- [ ] #4 i18n: ko/en 랭킹 라벨(제목/순위/이름/점수/등록/건너뛰기/로딩/에러/빈상태/표식)
- [ ] #5 rules + 테스트: AC-01~05 통과
- [ ] #6 service + 테스트: fetch 모킹 AC-01~04 통과
- [ ] #7 LeaderboardPanel: 로딩/목록/빈/에러/강조/👑/언어전환
- [ ] #8 NameEntryDialog: HTML input, 필수검증, IME, DOM 정리
- [ ] #9 presentLeaderboard: 4개 분기 흐름, onDone 보장
- [ ] #10 MenuScene: 랭킹 버튼 + 패널
- [ ] #11 종료 씬: 클리어(크레딧 후)·게임오버 삽입, cleared 값 정확
- [ ] #12 배포: build.yml env, .env.example, .gitignore, Secrets 등록
- [ ] 수동 검증(브라우저): 등록→재조회→강조, 오프라인 시 게임 정상
- [ ] 코드 리뷰

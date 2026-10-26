# admin-web-starter

> The default starting point for an admin web app on web-kit 1.0 and agent-workflow-kit.
> Clone it, run `pnpm install && pnpm dev:mock`, then replace the sample spec and screens with your own.

**이 스택으로 프론트를 시작하면 이 저장소로 시작한다.**

관리자 웹을 새로 만들 때 쓰는 기본 저장소다. 키트 연결(세션·요청·QueryClient), 프로젝트 UI adapter, 예시 기능 하나(상품 목록·상세·등록·수정·로그인), mock API, 화면 테스트, CI까지 갖춰 두었다. 예시 기능의 값(검색 기본값·문구·업무 규칙)은 스타터가 정한 예시이며 제품 결정이 아니다.

## 스택

| 영역 | 사용 |
|---|---|
| 화면 | React 19.2, Base UI 1.7 + Tailwind CSS 4 |
| 라우팅 | TanStack Router 1.170 (파일 route, `@tanstack/router-plugin`) |
| 데이터·폼·표 | TanStack Query 5, TanStack Form 1, TanStack Table 9 |
| 계약 | zod 4, axios 1.20, orval 8 (OpenAPI → endpoint 함수) |
| 문구 | i18next 26 + react-i18next 17 (ko/en) |
| 검사 | TypeScript 5.9, ESLint 10(typescript-eslint, react-hooks), Vitest 4 + Testing Library + jsdom, msw 2 |
| 실행 | Node 24, pnpm 10.33 |

두 키트:

- **[web-kit](https://github.com/taehyung-lab/web-kit)** (`@boosterlab/web-kit` 1.0.2): 실패 12종·세션 수명·요청 처리·QueryClient 규칙·URL 검색·목록·폼·단건 상태·adapter 검사. 동작 코드와 사용 스킬을 같은 버전으로 준다. `vendor/`의 release tarball로 설치한다(아래 「두 키트가 프로젝트에 들어오는 방식」).
- **[agent-workflow-kit](https://github.com/taehyung-lab/agent-workflow-kit)**: 요구 → 조건 → 검사로 잇는 에이전트 작업 기준. `AGENTS.md`의 표시 영역, `CLAUDE.md`, `.agents/skills/wf-*`를 설치한다.

## 빠른 시작

```sh
pnpm install
pnpm dev:mock      # msw mock API로 실행. 계정 admin / password
```

| 명령 | 하는 일 |
|---|---|
| `pnpm dev` | 실제 API에 붙여 개발 서버 실행(`.env.local` 필요) |
| `pnpm dev:mock` | mock API(브라우저 service worker)로 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm typecheck` · `pnpm lint` · `pnpm test` | 타입·lint·테스트 |
| `pnpm api:generate` | `openapi/sample.json` → `src/api/generated` |
| `pnpm check` | typecheck + lint + test + build. CI(`.github/workflows/check.yml`)도 이것을 돌린다 |
| `pnpm test:e2e` | 실제 브라우저(chromium, mock 모드) 검사. 처음 한 번 `pnpm exec playwright install chromium`. CI는 `check` 뒤에 돌린다 |

mock 모드에서는 access 토큰이 2분 뒤 만료되고, 새로고침하면 mock 서버 상태가 초기화된다. 그래서 401 → 재발급 → 재전송 흐름을 바로 볼 수 있다.

## 두 키트가 프로젝트에 들어오는 방식

이 저장소는 두 키트를 **프로젝트 안에 설치해서** 쓴다. 키트는 들어오는 방식이 서로 다르다.

| | agent-workflow-kit | web-kit |
|---|---|---|
| 맡는 일 | 에이전트가 일하는 방법: 요구 → 조건 → 구현 → 검증 → 교정 | 이 스택의 공통 동작 코드와 그 사용 기준 |
| 이 저장소에서 보이는 것 | `AGENTS.md`의 키트 표시 영역, `CLAUDE.md`, `.agents/skills/wf-*` | `vendor/boosterlab-web-kit-*.tgz`, `package.json`의 `file:` 의존, `.agents/skills/web-kit-*` |
| 들어오는 방법 | 키트의 `install.sh`가 **파일로 복사**한다 | release tarball을 `vendor/`에 두고 **패키지로 설치**한다. 스킬은 설치된 패키지 안의 것을 링크한다 |
| 버전 고정 | `.agents/agent-workflow-kit.version`의 커밋 | `package.json`·lockfile·tarball(버전 번호 하나 = 내용 하나) |
| 갱신 | `install.sh --update` | 새 tarball로 교체하고 `pnpm install` |
| 고치는 곳 | 이 저장소에서 키트 소유 파일을 고치지 않는다. 키트 저장소를 고치고 새 버전을 받는다 | 같다 |

복사로 들어오는 쪽(agent-workflow-kit)은 문서라서 파일이 프로젝트에 있어야 에이전트가 바로 읽는다. 패키지로 들어오는 쪽(web-kit)은 코드라서 버전 관리를 패키지 매니저에 맡기고, 사용 기준(스킬)은 같은 패키지에서 같은 버전으로 가져온다. 그래서 코드와 사용 기준이 서로 다른 버전이 되지 않는다.

**어떻게 시작하나**

- **새 프로젝트:** 이 저장소의 GitHub "Use this template"로 시작한다. 두 키트가 이미 설치돼 있다. `pnpm install` 뒤 `pnpm check`로 확인하고, `AGENTS.md`의 프로젝트 지도를 이 저장소 사실로 채운다(모르는 것은 `미확인`).
- **기존 프로젝트에 넣기:** 두 키트를 각자 방식으로 설치한다. 명령은 키트 README가 정본이다.
  1. [agent-workflow-kit README](https://github.com/taehyung-lab/agent-workflow-kit#readme)의 설치. 이미 `AGENTS.md`가 있으면 설치기가 아무것도 쓰지 않고 멈춘다. 병합은 키트 README의 안내를 따른다.
  2. [web-kit README](https://github.com/taehyung-lab/web-kit#readme)의 설치와 스킬 연결.
  3. 두 키트가 요구하는 연결(세션 저장 위치, 재발급 호출, 결과 코드 표)을 앱의 한 곳에 둔다. 이 저장소에서는 `src/app/web-kit.ts`가 그 자리다.

**에이전트는 이것을 어떻게 읽나**

세션이 열리면 `AGENTS.md`(키트 영역 + 프로젝트 지도)를 읽고, 바뀌는 책임에 맞는 스킬을 스킬 설명(description)으로 고른다. 요구를 정하고 검증하는 방법은 `wf-*`가, 목록·폼·단건·요청의 공통 동작은 `web-kit-*`가 알려 준다. 이 저장소의 제품 정책과 화면 구성은 프로젝트 지도와 `docs/product/`가 알려 준다. Claude Code와 Codex 모두 새 세션에서 `wf-*`와 `web-kit-*`를 찾는 것을 확인했다.

**실패가 나면 어디를 고치나**

원인을 가진 곳을 고친다. 상품 정책·서버 연결·화면은 이 저장소를, 모든 소비자에게 같은 공통 동작은 web-kit을, 작업 방법은 agent-workflow-kit을 고친다. 키트를 고치면 새 버전으로 내고, 이 저장소는 그 버전으로 갱신한 뒤 자기 `pnpm check`를 통과시킨다. 자동으로 모든 프로젝트가 바뀌지는 않는다.

## 구조

```
openapi/sample.json          예시 API 명세(Spring 봉투). 실제 명세로 교체한다
src/
  app/
    web-kit.ts               키트 연결의 유일한 진입: 세션·http·QueryClient·결과 코드 표·orval mutator
    auth.tsx                 로그인·로그아웃 → session.start/end, 세션 종료(by) → 로그인 이동
    App.tsx router.tsx       provider 조립, router 생성
    errors.tsx               route 오류·없는 경로·마지막 오류 경계
    i18n.ts env.ts notices.ts
  api/generated/             orval 생성물(commit 대상, 직접 고치지 않음)
  features/
    products/                예시 기능
      api/                   queryOptions·mutation·DTO 변환·무효화 선언
      model/                 검색 선언(defineSearch)·폼 schema·요청 변환
      screens/               목록·상세·등록·수정 화면과 화면 테스트
    auth/                    로그인 화면·요청
  shared/
    ui/                      프로젝트 UI adapter(Base UI + Tailwind, 도메인 모름)
    lib/                     실패 문구 키·폼 문구 해소
  routes/                    파일 route(validateSearch·beforeLoad·loader 미리 받기)
  mocks/                     msw handler·메모리 DB(테스트와 dev:mock 공용)
  test/                      테스트 준비·앱 렌더 도우미
docs/product/                제품 정책 문서 자리(비어 있음)
vendor/                      web-kit release tarball
.agents/skills/              wf-*(작업 기준) + web-kit-*(node_modules로 가는 링크)
```

`src/shared`는 `app`·`features`·`api`·`routes`를 import하지 않는다(ESLint로 검사). `features`는 `routes`를 모른다.

### 예시가 보여 주는 것

| 위치 | 보여 주는 키트 사용 |
|---|---|
| `app/web-kit.ts` | localStorage `SessionStore` + storage 이벤트, 공개 요청으로 재발급, `isPublic`·`prepare`(Accept-Language)·axios 기본값, QueryClient retry·staleTime·`notify` 예시, 예시 결과 코드 행 |
| `app/auth.tsx` | 캡처한 토큰으로 로그아웃, `ended`의 `by`(local·other-tab·server)별 이동 |
| 상품 목록 | `defineSearch`(쉼표 목록 `encode`, 기간 묶음 `valid`, `view` key, 고정 목록은 `z.enum`·서버 선택지(분류)는 `check` — 없는 값은 그 필드만 기본값), route `validateSearch` + `beforeLoad`, `useList` 선택·일괄 작업(`/dialog` 확인)·결과가 있는 재조회 실패의 `refresh()`, `/api` 반복 키 직렬화 |
| 상품 상세 | `useRecord(options, id)`, loader는 미리 받기만, `RecordStateBoundary` |
| 등록·수정 | `useSaveForm`(수정은 확인창), 서버 필드 오류 `fieldError`, `unattachedFieldErrors` 한 줄, `onSaved(result)`로 새 id 상세 이동, 이탈 보호 |
| 로그인 | 공개 요청, `onSaved(result)`로 받은 토큰으로 세션 시작, 자격증명 401 → 입력 아래 한 줄 |
| `shared/ui` | Field(FieldFrame + `formFieldControlId`), ConfirmDialog(stage, 저장 중 닫기 차단), Table(TanStack Table), FilterMessage(FilterError), RecordStateBoundary, RetryRegion |

실패 문구는 실패 종류·`messageKey`로만 고른다. 서버 `resultMessage`는 화면에 보이지 않는다.

### 테스트

- `shared/ui/adapters.test.tsx`: 실제 Field·ConfirmDialog·RetryRegion에 `/testing`의 `checkFieldAdapter`·`checkConfirmDialogAdapter`·`checkRetryFocusAdapter`.
- 화면 테스트(실제 앱 조립 + msw, 요청·URL·focus 관찰): 목록 진입 주소 정규화, 없는 상태·정렬 값과 서버 선택지에 없는 분류의 기본값 복구(선택지 확인 전 목록 요청 0건), 선택지 조회 실패 시 조회 보류와 재시도, 일괄 작업의 HTTP 200 업무 거절, 등록 뒤 새 상세로 이동, 수정 저장의 서버 필드 오류, 상세 not-found(GET 정확히 1건), 로그인 뒤 원래 화면 복귀, 401 → 재발급 → 재전송, 재발급 거절 → 세션 종료 → 로그인 이동, 로그인 자격증명 거절.
- 실제 브라우저(`tests/e2e`, Playwright + mock 모드): 한 탭의 로그아웃 → 다른 탭 세션 종료, 없는 값이 든 진입 주소의 교체와 "선택지 응답 뒤 목록 요청" 순서, 결과가 있을 때 재조회 실패 → 행 유지와 다시 시도.
- `src/test/skill-links.test.ts`: 설치된 web-kit 스킬이 `.agents/skills`에 빠짐없이 연결되고 끊긴·남은 링크가 없는지.

## 화면 추가하기

필요한 단계는 `AGENTS.md`의 「필요한 단계만」, 역할 스킬·제품 정책·화면 연결·검사는 「화면 작업 근거」를 따른다. `src/features/products/`의 `api/` · `model/` · `screens/`가 화면 연결 예시다.

## 실제 API 연결하기

1. `openapi/sample.json`을 실제 서버 명세로 바꾸고(파일 이름을 바꾸면 `orval.config.ts`의 `input`도) `pnpm api:generate`를 돌린다. 생성물은 commit한다.
2. `src/app/web-kit.ts`의 결과 코드 표를 **서버 enum에 있는 행으로만** 다시 적는다. 예시 두 행(세션 종료 4012, 대상 없음 4040)은 지운다. 세션 종료 행은 서버 계약이 확정된 것만 둔다(web-kit 결정 기록 0001의 E1–E3).
3. `PUBLIC_PATHS`·`REISSUE_PATH`·재발급 본문, `SessionStore` 저장 위치를 서버 인증 계약에 맞춘다.
4. `.env.example`을 `.env.local`로 복사해 `VITE_API_BASE_URL`·`VITE_API_TIMEOUT_MS`를 채운다. 비밀값은 commit하지 않는다.
5. 예시 기능(`features/products`, `routes/_app/products`, `mocks`의 상품 handler)을 자기 도메인으로 바꾸거나 지운다.

mock 통과나 HTTP 200만으로 서버 계약을 확인했다고 보지 않는다. 실제 서버로 401·재발급·필드 오류 모양을 따로 관찰한다.

## 키트 업그레이드

**web-kit** — 새 release tarball로 교체하고 스킬 링크를 다시 건다.

```sh
gh release download v<버전> --repo taehyung-lab/web-kit --pattern 'boosterlab-web-kit-<버전>.tgz' --dir vendor
pnpm add @boosterlab/web-kit@file:vendor/boosterlab-web-kit-<버전>.tgz
git rm vendor/boosterlab-web-kit-<이전 버전>.tgz
for s in node_modules/@boosterlab/web-kit/skills/*/; do ln -sfn "$(python3 -c 'import os,sys;print(os.path.relpath(sys.argv[1],".agents/skills"))' "$s")" ".agents/skills/$(basename "$s")"; done
pnpm check
```

package.json·lockfile·tarball을 한 commit에 넣는다. 스킬 링크는 `node_modules`를 가리키므로 `pnpm install` 전에는 열리지 않는다.

**agent-workflow-kit** — 확인한 버전의 로컬 키트 checkout에서:

```sh
bash /path/to/agent-workflow-kit/install.sh --update /path/to/admin-web-starter
```

키트 소유 부분이 설치 때 그대로일 때만 교체하고 `.agents/agent-workflow-kit.version`을 갱신한다. diff를 검토한 뒤 반영한다.

## 키트가 맡는 것과 프로젝트가 맡는 것

| 키트가 맡는다 | 프로젝트가 맡는다 |
|---|---|
| 실패 12종 해석, 봉투 해제, 결과 코드 표 조회 | 서버 enum의 결과 코드 행, 실패 종류별 문구 |
| 세션 세대·시작/종료·다른 탭 감지·재발급 단일 비행 | 토큰 저장 위치, 재발급 호출, 종료 뒤 이동·안내, idle |
| 토큰 헤더, 401 재발급 뒤 한 번 재전송, 반영 여부 판정 | 공개 경로, 운영 헤더, axios 기본값 |
| 조회 재시도 대상, 실패 알림 한 번, 선언한 무효화, 세션 전환 시 캐시 비움 | 재시도 횟수, staleTime, 알림 표시 방식 |
| URL 필드 복구·정규 URL·진입 주소 교정, 검색 확정, 선택·일괄 작업 수명 | 검색 필드 schema·기본값·URL key, 필터 UI, 표 |
| 제출·확인 관문·저장·기준선·서버 필드 오류 부착·늦은 결과 차단 | 폼 schema, 원본·저장 함수, 확인창·이탈 UI, 문구 |
| 단건 네 상태와 갱신 사실 | 없음·실패 표시와 이동 |
| `AGENTS.md` 키트 영역, `CLAUDE.md`, `wf-*` 스킬 | `AGENTS.md` 프로젝트 지도·절, `docs/product/`, 역할 스킬 |

키트 문장을 프로젝트 문서에 복사하지 않는다. 키트 소유 파일은 고치지 않고, 바꿀 것이 있으면 키트에 반영한다.

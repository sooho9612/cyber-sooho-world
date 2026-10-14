# Home 광장 — 코딩 계획 (3단계)

> 전제: [`HOME_PLAZA_SCOPE.md`](./HOME_PLAZA_SCOPE.md) 합의 확정.  
> 이 문서는 **구현 착수 전 설계서**다. 승인 후 Agent가 이 순서대로 코딩한다.  
> 에셋: [`HOME_PLAZA_ASSET_SPEC.md`](./HOME_PLAZA_ASSET_SPEC.md)

---

## 0. 목표 한 줄

[`IntroTab`](../src/components/tabs/IntroTab.tsx)(자기소개)를 제거하고, 잔류형 아이소 광장(캐릭터 1인1 + 말풍선 1인1)으로 교체한다. 방명록·공지는 그대로.

---

## 1. 데이터 · RLS

### 1.1 테이블 `plaza_presence` (가칭)

유저당 1 row (UPSERT).

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `user_id` | uuid PK → `auth.users` / `profiles.id` | |
| `nickname` | text | 표시용 스냅샷(또는 join profiles) |
| `x` | real / numeric | 무대 정규화 좌표 0..1 권장 |
| `y` | real / numeric | 0..1 (바닥 영역 clamp) |
| `bubble_text` | text nullable | 한 줄 말풍선; null = 없음 |
| `updated_at` | timestamptz | |

제약:

- `bubble_text` 길이 CHECK (예: `char_length <= 40` — 확정값 §3)
- UNIQUE(`user_id`)

### 1.2 RLS

- **SELECT**: 모두(anon 포함) — 구경
- **INSERT/UPDATE**: `auth.uid() = user_id` 만 본인 row
- **DELETE**: 본인 **또는** `is_owner()`
- bubble만 지울 때: `bubble_text = null` UPDATE 허용 (본인)

마이그레이션: `supabase/migrations/YYYYMMDDHHMMSS_plaza_presence.sql`  
기존 guestbook/intro 데이터 **삭제 금지**. `intro_content` 테이블은 코드에서 안 쓰게만 하고 DB drop은 선택(명시 요청 시).

### 1.3 동기화 선택 (확정안)

- **MVP: 진입 시 fetch + 배치/말풍선 mutate 후 로컬 갱신**
- **보강(같은 PR 가능하면)**: Supabase Realtime `postgres_changes` on `plaza_presence` — “남이 옮긴 게 화면에 곧 반영”. 걷기 동기화 아님.
- 폴링 인터벌은 Realtime 없을 때만 fallback(예: 30s) — 기본은 Realtime 권장하되, 채널 실패 시 fetch만으로도 동작.

---

## 2. 프론트 구조

### 2.1 Intro 제거 → Plaza

| 작업 | 파일 |
|------|------|
| `IntroTab` 삭제 또는 `PlazaTab`으로 치환 | [`src/components/tabs/IntroTab.tsx`](../src/components/tabs/IntroTab.tsx) → `PlazaTab.tsx` |
| App 패널 키 `intro` 유지(또는 `plaza` rename) | [`src/App.tsx`](../src/App.tsx) — 기본 탭은 광장 |
| 타입 `AppTab` | [`src/types/index.ts`](../src/types/index.ts) |
| KeepAlive 키 목록 갱신 | App / KeepAlivePanels |

메뉴 **홈** 클릭 = 광장 (기존 intro 진입과 동일).

### 2.2 컴포넌트 분해

```
PlazaTab
├── PlazaStage          // inset 박스 + 배경 img + 클릭/터치 히트영역
│   ├── PlazaAvatar[]   // 스프라이트 + 닉네임 + 말풍선
│   └── (bubble layout pass)
├── PlazaToolbar        // Classic: 말풍선 입력 / 저장 / 내 말풍선 삭제 (로그인 시)
└── hooks/usePlazaPresence.ts  // fetch, upsert position, upsert bubble, delete, admin delete
```

스타일: `#c0c0c0` 크롬, 무대는 inset, `image-rendering: pixelated`.  
모달/알림: 기존 `classicAlert` / `classicConfirm` + §6 i18n.

### 2.3 좌표 · 텔레포트 · 간격

1. 무대 DOM 기준 클릭 → `clientX/Y` → 정규화 `(nx, ny)` in `[0,1]²`
2. **바닥 clamp**: `ny`를 walkable 밴드만 허용 (예: `y ∈ [0.45, 0.92]` — 배경 구도에 맞게 상수로 조정)
3. **최소 거리**: 다른 presence와 유클리드 거리 `< dMin`(예: 0.06)이면 가장 가까운 빈 쪽으로 **살짝 밀어 스냅** (텔레포트 후 보정). 실패 시 “자리가 좁습니다” alert
4. 저장: UPSERT `x,y` + `updated_at`
5. 렌더: `left: x*100%`, `top: y*100%`, `transform: translate(-50%, -100%)` (발 밑 기준). z-index = `y` 기반(아래 사람 앞)

앉기·걷기 애니·충돌 mesh: 없음.

### 2.4 말풍선 겹침 최소화

1. 각 아바타 머리 위 기본 앵커 `(ax, ay)`
2. 말풍선 박스 예상 폭(글자 수·폰트)으로 AABB
3. 겹치면 **위쪽으로 스택 오프셋** (`dy -= step`, 최대 N단) 후 좌우 ±소량
4. 그래도 겹치면 짧은 말풍선이 유리하도록 **max length**로 유도 (UI 카운터)
5. 모바일: 동일 알고리즘 + **탭한 아바타 말풍선 z-index 최상단** (한 명만 읽기 쉽게)

채팅 로그 컴포넌트 **만들지 않음**.

### 2.5 글자 수 · 폰트 (제안 확정값)

| 항목 | MVP 값 |
|------|--------|
| `bubble_text` max | **40** Unicode code points (한·영 동일 카운트; grapheme는 추후) |
| 입력 UI | Classic 한 줄 input + 잔여 글자 표시 |
| 폰트 스택 | `"DungGeunMo", "ThinRounded", "Noto Sans KR", "Noto Sans", sans-serif` — 픽셀 우선, 없는 글리프만 시스템/Noto. Inter/Roboto 단독 금지 |

유저 말풍선 본문은 **번역하지 않음** (§6.1.4).

---

## 3. 권한 UX

| 상태 | UI |
|------|----|
| 비로그인 | 무대 클릭 시 “로그인 후 배치할 수 있습니다” + 로그인 유도 |
| 로그인·미배치 | 클릭 = 첫 배치 |
| 로그인·배치됨 | 클릭 = 이동(텔레포트+간격) |
| 본인 | 툴바에서 말풍선 작성/수정/삭제 |
| owner | 각 아바타 컨텍스트 또는 선택 후 “관리자 삭제” |

---

## 4. 모바일

1. 배경을 콘텐츠 폭에 fit (가로 스크롤·핀치 팬 없음)
2. touch = 텔레포트 (PC와 동일)
3. 말풍선 입력: 무대 **아래** Classic 툴바 (키보드에 덜 가림). 필요 시 `classicPrompt` 대신 인라인
4. 글자 수·말풍선 max-width PC와 동일 40자 (모바일도 동일 규칙으로 단순화)
5. 미니맵 / D-pad / 드래그 맵 탐험: **1차 없음**

---

## 5. i18n (§6)

`src/i18n/messages.ts`에 `plaza.*` 키 **ko+en 동시** 추가 예:

- `plaza.loginToPlace`, `plaza.bubblePlaceholder`, `plaza.saveBubble`, `plaza.deleteBubble`, `plaza.deleteConfirm`, `plaza.tooCrowded`, `plaza.adminRemove`, `plaza.charsLeft` …

알림/확인도 `t()`만.

---

## 6. 에셋 연결

1. 오너 배경 → Storage URL 또는 `public/plaza/plaza_bg.png` ([스펙](./HOME_PLAZA_ASSET_SPEC.md))
2. 캐릭터 1종 → `public/plaza/avatar_stand.png` (임시 플레이스홀더 가능)
3. [`assets.ts`](../src/config/assets.ts)에 `plazaBg`, `plazaAvatar` 상수

배경 미준비 시: solid `#008080` + 격자 placeholder로 개발 가능.

---

## 7. 구현 순서 (체크리스트)

1. [ ] 마이그레이션 `plaza_presence` + RLS
2. [ ] `usePlazaPresence` (list, upsertPos, upsertBubble, clearBubble, adminDelete)
3. [ ] `PlazaStage` + 클릭 텔레포트 + 간격 스냅
4. [ ] Avatar + nickname + bubble layout
5. [ ] Toolbar + 권한 분기
6. [ ] Intro 제거, App/탭 연결, KeepAlive
7. [ ] i18n ko/en
8. [ ] 모바일 터치·툴바 확인
9. [ ] (선택) Realtime 구독
10. [ ] 로컬 확인 후 배포 (요청 시)

성능: 목록은 row가 작아 `select` 슬림 유지. 이미지 base64 금지. KeepAlive로 intro/plaza 전환 점프 방지(§5).

---

## 8. 명시적 Non-goals (이 계획에서 코딩하지 않음)

실시간 걷기, 앉기, 캐릭터 선택 UI, 채팅 로그, 멀티맵, 말풍선 TTL, intro_content 강제 DROP(별도 요청 전)

---

## 9. 착수 조건

- [x] 범위 합의 (`HOME_PLAZA_SCOPE.md`)
- [x] 에셋 해상도 가이드 (`HOME_PLAZA_ASSET_SPEC.md`)
- [ ] 배경(및 가능하면 아바타) 파일 수령 **또는** placeholder로 진행 OK
- [ ] 사용자: “코딩 ㄱㄱ / 3단계 실행” 명시

→ 위 체크 후 이 문서 순서대로 구현 시작.

# CYBER SOOHO WORLD — Design Constitution

> **기술은 최신, 겉모습은 Web 1.0 완전복각.**  
> 시각·상호작용의 정답은 **Windows Classic (Windows 95/98/2000 계열)** 이다.  
> 이 문서는 이후 모든 UI/UX 작업의 헌법이다. 충돌 시 이 문서가 우선한다.

---

## 0. 최상위 원칙 (Non-negotiable)

1. **Dual-stack 원칙**  
   - 구현: React, Vite, TypeScript, Tailwind, Supabase 등 현대 스택을 자유롭게 사용한다.  
   - 표현: 사용자가 느끼는 화면·소리·커서는 **1990년대 후반~2000년대 초반 홈피 / Win32 Classic** 이어야 한다.

2. **복각이지 패러디가 아니다**  
   - “레트로풍 감성”이 아니라 **당시 UI 규칙을 충실히 따른다.**  
   - 유리질감(glass), 네온 글로우, 과한 그림자, 둥근 알약 버튼, 그라데이션 CTA는 금지.

3. **브랜드 테스트**  
   - 첫 화면에서 네비/브랜드를 지워도 **Windows Classic 창 + 틸 바탕화면**이 남아야 한다.  
   - 다른 SaaS 랜딩페이지처럼 보이면 실패다.

4. **의도적 한계를 존중**  
   - Web 1.0의 매력은 “여백의 미”가 아니라 **제약 속 표현**이다.  
   - 800×600 시대의 밀도·테두리·픽셀을 기준으로 설계한다.

---

## 1. 시각 정체성: Windows Classic 100%

### 1.1 컬러 팔레트 (공식)

Windows Standard / 본 프로젝트 실사용 값과 일치시킨다.

| 역할 | Hex | 용도 |
|------|-----|------|
| Desktop / Teal | `#008080` | 바탕(또는 Bliss/틸 배경 이미지) |
| Button Face (Chrome) | `#c0c0c0` | 창·버튼·패널 기본면 |
| Button Highlight | `#ffffff` | 3D 밝은 모서리 (좌/상) |
| Button Light | `#dfdfdf` | outset/inset 보조 하이라이트 |
| Button Shadow | `#808080` | 3D 어두운 모서리 |
| Button Dark Shadow / Frame | `#404040` ~ `#000000` | 외곽·깊은 그림자 |
| Window Text | `#000000` | 본문 텍스트 |
| Window Background | `#ffffff` | 입력창·콘텐츠 영역 |
| Active Title Bar | `#000080` → `#1084d0` | 타이틀바 그라데이션(좌→우) |
| Title Bar Text | `#ffffff` | 활성 창 제목 |
| Highlight / Selection | `#000080` | 선택·호버(흰 글자) |
| App Workspace / Disabled | `#808080` | 비활성·보조 |
| Status / Accent Yellow | `#ffff00` | 푸터 장식 문구 등 한정 사용 |
| Hyperlink (Web 1.0) | `#0000EE` (방문 `#551A8B`) | 텍스트 링크 기본 |

**금지 색 경향**

- 보라/인디고 그라데이션 랜딩, 네온 핑크·시안 글로우  
- flat Material / iOS 시스템 블루를 주조색으로 쓰기  
- 반투명 블러 배경

### 1.2 3D 베벨 규칙 (가장 중요)

광원은 **항상 왼쪽 위**.

- **Raised (outset)** — 버튼, 탭, 카드형 크롬  
  - 위·왼쪽: 밝음 (`#fff` / `#dfdfdf`)  
  - 아래·오른쪽: 어두움 (`#808080` / `#000` / `#404040`)
- **Sunken (inset)** — 입력창, 콘텐츠 함몰, 눌린 버튼  
  - 위·왼쪽: 어두움  
  - 아래·오른쪽: 밝음
- 보더 두께: 보통 `2px`~`3px`. hairline 한 줄만으로 “카드처럼” 보이게 만들지 말 것.
- `box-shadow`로 현대식 soft shadow를 쌓지 말 것. 필요하면 **inset 베벨**로만.

### 1.3 타이포그래피

| 용도 | 폰트 | 비고 |
|------|------|------|
| UI 기본 | `ThinRounded` / `DungGeunMo` 계열 (픽셀·도트 감성) | 현재 `index.css` 기본 |
| 시스템 크롬 보조 | `Tahoma`, `"MS Sans Serif"`, `sans-serif` | 타이틀바·상태바 |
| 코드/장식 모노 | `"Courier New"`, `Courier`, `DotMatrix` | 미디어 플레이어 등 |
| 본문 폴백 | 비트맵 감성 폰트 우선, 없으면 시스템 sans | |

**규칙**

- Inter, Roboto, system-ui 중심의 “모던 SaaS 타이포” 금지.  
- 본문 기본 크기 감각: **11~14px** (Win95 UI 스케일). 큰 디스플레이 헤드라인 금지.  
- 제목은 bold + Navy(`#000080`) 또는 타이틀바 흰 글자로 처리.  
- 자간을 현대적으로 넓히거나 가변 폰트 디스플레이 연출 금지.

### 1.4 아이콘·이미지·커서

- 이미지: `image-rendering: pixelated` / `crisp-edges` 유지.  
- GIF·작은 아이콘·클립아트 톤 허용 (Web 1.0).  
- 커스텀 커서(`cursor_sc_nomal` / `cursor_sc_select`) 유지. OS 기본 포인터로 대체하지 말 것.  
- 사진도 “예쁜 라운드 카드 갤러리”보다 **inset 프레임 안 썸네일**이 기본.

### 1.5 모션

- 허용: 클릭 사운드, 간단한 눌림(inset), 무지개 재생 탭 같은 **장난스러운 한정 연출**.  
- 금지: fade/slide 페이지 전환, spring, parallax, 스크롤 스토리텔링, 마이크로인터랙션 남발.  
- “부드럽게”보다 “즉각적으로”가 정답.

---

## 2. Web 1.0 레이아웃·정보구조

### 2.1 창(Window)이 페이지다

- 사이트는 **데스크톱 위 단일(또는 소수) 애플리케이션 창**으로 읽혀야 한다.  
- 기준 폭: 약 **800px** (`max-w-[800px]` 수준).  
- 모바일에서는 창이 풀폭이 되어도, **크롬(타이틀바·메뉴·베벨)은 유지**.

구성 순서 (기존 구조 유지):

1. Title bar (`WindowsTitleBar`)  
2. Menu bar (`MenuBar`)  
3. Banner / Header  
4. Tab navigation (`Navigation`)  
5. Content area  
6. Status bar (하단 Online 등)

### 2.2 Web 1.0 레이아웃 특징 (따를 것)

- **테이블/그리드 밀도**: 여백을 현대 랜딩처럼 크게 비우지 않는다.  
- **보이는 테두리**: 구분선·inset 박스로 영역을 나눈다.  
- **중앙 정렬 창 + 틸/이미지 바탕**.  
- **탭·게시판·방명록·카운터·상태바** 같은 홈피 장치 환영.  
- “Best viewed in … 800×600” 같은 **메타 유머** 허용.  
- 대시보드형 KPI 카드, 히어로 풀블리드 마케팅 섹션 금지.

### 2.3 컴포넌트별 규칙

| 요소 | 규칙 |
|------|------|
| 버튼 | `#c0c0c0` + outset. 클릭 시 inset. hover 시 `#000080` 배경 + 흰 글자 허용 |
| 입력 | 흰 배경 + inset. 라운드 없음 |
| 탭 | 활성=흰/inset, 비활성=회색/outset |
| 모달 | 중앙 회색 창 + 네이비 타이틀바. 반투명 오버레이는 최소한의 dim만 |
| 리스트/게시물 | 흰/회색 패널 + outset 아이템. 카드 그림자 금지 |
| 링크 | 밑줄 있는 하이퍼링크 감각 유지 가능 |
| 슬라이더(트랙바) | **Windows Classic trackbar만**. 홈(groove)=inset 홈, 손잡이=사각 `#c0c0c0` outset. OS/브라우저 기본 `input[type=range]`(파란 원형 thumb 등) **금지**. 재사용: `ClassicSlider` |
| 색 선택 | **Win Classic Color 대화상자** (스펙트럼·명도·HSL/RGB). 브라우저 기본 `input[type=color]` 팝업(그라데이션·스포이드·머티리얼 슬라이더) **금지**. 재사용: `ColorPickerDialog`. 작은 스와치 팔레트는 허용 |

### 2.4 슬라이더·색 선택 (필수)

제어판·환경설정·속성 창을 포함해 **모든** 속도/수치 슬라이더와 색 피커는 Classic이어야 한다.

**슬라이더**
- 트랙: `#c0c0c0` 면 + 위·왼쪽 `#808080`, 아래·오른쪽 `#dfdfdf` (sunken groove)
- Thumb: 사각 블록, outset 베벨. 원형·알약·파란색 Material thumb 금지
- 값 숫자는 옆에 평문 표시 가능

**색**
- 클릭 시 `ColorPickerDialog` (또는 동등한 Classic Color UI)
- 미리보기 칸은 inset 색 사각형 + 선택적 hex 텍스트
- OS 네이티브 color picker / 둥근 hue bar / eyedropper 시트 금지

---

## 3. 콘텐츠 톤 & 홈피 문법

- 개인 홈페이지(미니홈피/사이월드 감성 + Win 데스크톱)다.  
- 따뜻하고 투박하며, **사람 냄새**가 있어야 한다.  
- 기업 랜딩 카피(“Unlock productivity”) 금지.  
- 방명록, 일기, 음악, 장난감 등 **놀이터** 기능을 우선한다.

---

## 4. 기술 규칙 (현대 스택이어도 UI 헌법을 깨지 말 것)

### 허용
- React / Vite / TS / Tailwind 유틸  
- Supabase (DB, Storage, Realtime)  
- GitHub → Vercel 자동배포  
- lucide 아이콘 **단**, 크기는 작고 Win 버튼 안에 넣기

### 금지 (UI 결과물 기준)
- shadcn 기본 룩 그대로, 라운드 카드, soft shadow, glassmorphism  
- dark mode 토글 중심 UX  
- Inter/시스템 폰트 기반 “깔끔한” 리디자인  
- 반응형을 이유로 베벨·타이틀바를 제거하는 것

### Tailwind 사용 시
- 유틸은 도구일 뿐, 결과물이 Classic이어야 한다.  
- `rounded-xl`, `shadow-lg`, `backdrop-blur` 등을 기본값으로 쓰지 말 것.  
- 색은 위 팔레트 hex를 직접 쓰거나 CSS 변수로 고정.

권장 CSS 변수 (신규 스타일 시):

```css
:root {
  --win-desktop: #008080;
  --win-face: #c0c0c0;
  --win-highlight: #ffffff;
  --win-light: #dfdfdf;
  --win-shadow: #808080;
  --win-dark: #404040;
  --win-ink: #000000;
  --win-window: #ffffff;
  --win-title: #000080;
  --win-title-end: #1084d0;
  --win-select: #000080;
}
```

---

## 5. 성능·로딩 최적화 (기본값 — 비슷 기능이면 항상)

시각 복각과 별개로, **탭/섹션형 데이터 UI**를 만들 때 아래는 선택이 아니라 기본 작업이다.  
(업계 관례: SWR / TanStack Query의 stale-while-revalidate + list/detail projection + keep-alive)

### 5.1 로딩 시간

1. **목록은 가볍게, 상세는 필요할 때만**  
   - 리스트 쿼리에 `select('*')` + 갤러리/본문/base64 JSON을 넣지 않는다.  
   - `listSelect`로 카드에 필요한 컬럼만 (`thumbnail` / `photo_count` / 메타).  
   - 상세·수정 진입 시에만 전체 row를 다시 받는다 (`BoardLayout`의 detail hydrate).
2. **이미지를 DB 셀에 base64로 쌓지 않는 방향**을 장기 목표로 한다.  
   - 단기: 썸네일 컬럼 분리 + 목록에서 gallery 제외.  
   - 장기: Supabase Storage URL. 목록 페이로드가 수 KB가 되게.
3. **저장 시 목록용 필드를 같이 갱신**한다 (`thumbnail_url` / `image_url`, `photo_count` 등).

### 5.2 메모리 캐시 (SWR)

1. 테이블(또는 동등 리소스)별 **모듈 메모리 캐시**를 둔다 (`boardQueryCache`).  
2. 탭에 다시 오면 **캐시를 즉시 그리고**, 뒤에서 조용히 재검증한다.  
3. 생성·수정·삭제 후 해당 테이블 캐시를 **invalidate**한다.  
4. React Query를 안 써도 같은 패턴을 지킨다. 새 보드를 만들면 `BoardLayout` + 캐시를 재사용한다.

### 5.3 섹션 전환 · 창 높이 (“왔다 갔다” 금지)

1. 메인 탭·기록 서브탭은 **방문한 패널을 unmount하지 않는다** (`KeepAlivePanels`: 최초 방문 시 mount, 이후 `display:none`).  
2. 콘텐츠 영역에 **공통 min-height**를 둔다 (`SECTION_CONTENT_MIN_HEIGHT` / `WindowFrame` 최소 높이).  
3. 첫 로드 스켈레톤도 같은 바닥 높이를 지켜, Loading ↔ 리스트 전환으로 창이 수축·팽창하지 않게 한다.  
4. fade/slide 전환으로 점프를 “가리지” 말 것 — 높이를 안정시키는 것이 Classic 정답이다.

### 5.4 새 보드/탭 체크 (필수)

- [ ] `BoardLayout`(또는 동등) + 테이블 캐시 키  
- [ ] `listSelect`로 무거운 컬럼 제외  
- [ ] 상세에서 full row hydrate  
- [ ] Keep-alive 또는 동등한 remount 방지  
- [ ] 콘텐츠 min-height로 창 점프 없음  

---

## 6. Do / Don’t 체크리스트

### Do
- [ ] 새 UI가 회색 크롬 + outset/inset 인가?  
- [ ] 타이틀바/메뉴/상태바 문법을 깨지 않았는가?  
- [ ] 픽셀 커서·픽셀 이미지 렌더링이 유지되는가?  
- [ ] 800px 창 중심 레이아웃인가?  
- [ ] 사운드/클릭감이 “투박하지만 즉각적”인가?  
- [ ] 섹션형 데이터면 §5 성능 규칙(캐시·listSelect·keep-alive·min-height)을 지켰는가?

### Don’t
- [ ] 모던 카드·알약 버튼·소프트 섀도  
- [ ] 넓은 히어로·마케팅 섹션  
- [ ] 글래스/블러/네온  
- [ ] “세련된” 타이포 교체  
- [ ] Web 1.0을 조롱하는 과한 패러디(가독성 파괴용 blink 남발 등). **복각이 목표**다.  
- [ ] 파란 원형 range thumb / OS 기본 color picker  
- [ ] 목록에서 gallery/base64 통째로 `select('*')`  
- [ ] 탭 전환마다 보드 unmount → Loading으로 창이 흔들리게 두기  

---

## 7. 작업 시 Agent / 인간 공통 지침

1. UI 변경 PR/커밋 전에 이 헌법을 다시 읽는다.  
2. 기존 컴포넌트(`WindowFrame`, `WindowsTitleBar`, `MenuBar`, `Navigation`)의 크롬을 존중하고, 우회하는 새 쉘을 만들지 않는다.  
3. “더 현대적으로”, “더 깔끔하게”라는 요청이 와도 **시각 복각을 깨지 않는 선**에서만 개선한다.  
4. 기능 추가는 환영. 시각 언어 변경은 헌법 개정 없이는 금지.  
5. 게시판·갤러리·탭형 목록을 새로 만들면 **§5를 기본 골격으로** 시작한다 (`BoardLayout`, `boardQueryCache`, `KeepAlivePanels`).

---

## 8. 개정

- 이 문서를 바꾸려면 사용자가 명시적으로 “헌법 수정”을 요청해야 한다.  
- 코드가 헌법과 어긋나면 **코드를 고친다**. 헌법을 코드에 맞추지 않는다. (단, 문서의 팩트 오류 수정은 가능)

---

*Last updated: 2026-10-06 — §5 performance defaults (SWR cache, list projection, keep-alive).*

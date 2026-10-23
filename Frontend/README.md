# Frontend

ERP Legend 프론트엔드. 로그인 후에만 사용하는 ERP라 SEO가 필요 없어 SSR 없이 SPA(CSR)로 구성한다.
빌드 결과(`dist/`)는 Nginx가 정적 파일로 서빙하고, `/api/*` 요청은 Nginx가 Nest.js로 리버스 프록시한다.

## 요구 사항

- Node.js 24 (`.nvmrc` 참고)

```bash
nvm use 24
npm install
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (http://localhost:5173). `/api` 요청은 `http://localhost:3000`(Nest)으로 프록시 |
| `npm run build` | 타입 검사 후 운영 빌드. 결과물은 `dist/` |
| `npm run preview` | 운영 빌드 결과를 로컬에서 확인 |
| `npm run lint` | oxlint로 코드 검사 |

## 기술 스택

| 패키지 | 역할 |
|---|---|
| React 19 + TypeScript | UI 라이브러리와 타입 시스템 |
| Vite 8 | 개발 서버와 빌드 도구 |
| Tailwind CSS 4 | 스타일. 설정은 `tailwind.config.js` 없이 `src/index.css`의 `@theme`에서 관리 |
| shadcn/ui | 버튼, 뱃지, 카드 등 기본 UI 부품. 코드가 `src/components/ui/`에 복사되는 방식이라 직접 수정 가능 |
| @base-ui/react | shadcn 컴포넌트의 동작(키보드, 포커스, 접근성)을 담당하는 headless UI 라이브러리 |
| class-variance-authority | 컴포넌트 variant(`variant="outline"`, `size="lg"`)를 Tailwind 클래스 묶음으로 매핑 |
| cn | 클래스 이름 병합과 Tailwind 클래스 충돌 정리 (`px-2` + `px-4` → `px-4`) |
| lucide-react | 아이콘 |
| tw-animate-css | 모달, 드롭다운 등장/퇴장 애니메이션 클래스 |
| Pretendard | 기본 폰트 (dynamic subset으로 필요한 글자 묶음만 로드) |
| @tanstack/react-query | 서버 데이터 조회, 캐시, 갱신 |
| react-router | 페이지 라우팅 |
| zustand | 클라이언트 전역 상태. 서버 데이터는 react-query가 담당하므로 꼭 필요한 경우에만 사용 |
| oxlint | 코드 검사 (ESLint 대체) |

## 디렉토리 구조

```
src/
├── main.tsx            # 진입점. react-query, router 연결
├── App.tsx             # (임시) 테마 색상 확인 페이지
├── index.css           # Tailwind, 폰트, 테마 색상
├── components/
│   └── ui/             # shadcn 기본 부품. 업무 로직과 API 호출을 넣지 않는다
└── lib/
    └── utils.ts        # cn 유틸
```

- `@/`는 `src/`를 가리킨다. 예: `import { Button } from '@/components/ui/button'`
- 주문 상태 뱃지처럼 업무를 아는 컴포넌트는 `components/ui/` 밖에 둔다.

## 테마

색상은 홈 화면 시안에서 추출했다. 정의는 `src/index.css`에 있다.

- shadcn 표준 변수(`:root`): `primary`, `background`, `foreground`, `muted-foreground`, `accent`, `destructive`, `border` 등
- 시안 전용 색(`@theme`): `ink`, `warning*`, `danger-*`, `success*`, `subtle-foreground`, `divider` 등
- 사용 예: `bg-primary`, `text-muted-foreground`, `bg-warning-soft text-warning`
- 글자 색(foreground 계열, 상태 글자색)은 이미지에서 추출한 근사값이다. 디자인 원본 값을 받으면 교체한다.

## shadcn 컴포넌트 추가

```bash
npx shadcn@latest add dialog select
```

shadcn은 Base UI 기반이다. 인터넷 예제 대부분은 Radix 기준이라 `asChild` 대신 `render` 속성을 써야 한다.

## 나중에 추가할 것

- fetch wrapper (401 시 토큰 갱신 후 재시도)
- 라우트 구조: 고객 `/`, 관리자 `/admin/*`
- react-hook-form + zod (입력 폼)
- AG Grid (대량 데이터 표)
- vite-plugin-pwa (PWA)

# BEN Backend

Next.js Route Handlers 기반의 BEN 백엔드입니다. 현재 사용자, 고객사 계정, 메인/서브계정, 자체 로그인, Google/Kakao/Naver OAuth, JWT와 Redis 세션을 구현합니다.

## 로컬 실행

```bash
cp .env.example .env.local
docker compose up -d
npm run db:migrate
npm run dev
```

기본 주소는 `http://localhost:3000`입니다. 프런트엔드는 `.env.local`의 `FRONTEND_URL`에 맞춥니다.

## 인증 정책

- 고객사별 메인계정 1개, 서브계정 여러 개
- 고객사 코드는 메인계정이 직접 선택하며 서브 로그인에만 사용
- 메인 로그인: 이메일 + 비밀번호 또는 SSO (고객사 코드 불필요)
- 서브 로그인: 고객사 코드 + 로그인 ID + 비밀번호 또는 고객사 코드 + SSO
- 서브 SSO 전용 계정: 메인이 이메일/제공자를 지정해 초대하고 이메일 일치 확인 후 활성화
- Access Token: JWT, 기본 15분
- Refresh Token: JWT, 기본 7일
- Redis: 세션과 Refresh Token SHA-256 해시 저장
- Refresh Token: 사용할 때마다 회전하며 이전 토큰 재사용 시 세션 폐기
- 브라우저: HttpOnly 쿠키 사용
- API 클라이언트: 로그인 응답의 Access Token을 Bearer 토큰으로 사용 가능

## 명령어

```bash
npm run lint
npm test
npm run build
npm run db:generate
npm run db:migrate
```

API 명세는 [docs/openapi.yaml](docs/openapi.yaml), 데이터 모델은 [docs/user-auth-erd.md](docs/user-auth-erd.md), 작업 규칙은 [Agent.md](Agent.md)를 참고합니다.

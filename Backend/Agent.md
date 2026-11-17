# BEN Backend Agent Notes

## 2026-11-17 회원 정책 변경

- BEN 관리자가 고객사와 고객사당 1개의 MAIN/OWNER 계정을 먼저 등록한다.
- 신규 SSO 사용자는 고객사를 직접 생성하지 않고 `users`와 `oauth_identities`만 가진 소속 없는 계정으로 시작한다.
- 신규 사용자는 사업자등록번호로 소속 요청을 제출하고 고객사 MAIN/OWNER가 승인한다.
- 승인 시 SUB 멤버십을 생성하며 다음 SSO 로그인부터 정상 JWT를 발급한다.
- 가입 API는 고객사 존재 여부와 타 고객사명을 노출하지 않는다.

## 로컬 개발 시드

- `npm run db:seed:option3`은 재실행 가능한 로컬 개발 시드다.
- `admin@ben-logistics.com`은 `system_role=BEN_ADMIN`, `ben-internal`의 MAIN/OWNER다.
- `owner@demo-ben.com`은 `demo` 고객사의 MAIN/OWNER다.
- 개발 비밀번호는 소스나 문서에 저장하지 않고 시드 실행 결과를 전달받아 사용한다.

## Postman

- Postman CLI가 전역 설치되어 있으며 `postman --version`으로 확인한다.
- API 계약의 기준 파일은 `docs/openapi.yaml`이다.

## 사용자 도메인 결정사항

- `User`는 사람의 신원이다. 고객사 데이터 경계는 `Account`다.
- 메인/서브계정은 `AccountMember.type`의 `MAIN`/`SUB`로 구분한다.
- `OWNER`는 메인계정, `ADMIN`과 `MEMBER`는 권한이 다른 멤버 역할이다.
- 고객사마다 메인계정은 DB 제약으로 정확히 1개만 허용한다. 서브계정 생성·조회·수정·비활성화는 메인 `OWNER`만 수행한다.
- 고객사 코드는 메인계정이 가입할 때 `ben`, `kcvg`처럼 직접 정하며 전체 시스템에서 유일하고 소문자로 정규화한다.
- 메인계정 자체 로그인은 이메일과 비밀번호만 받고 고객사 코드를 요구하지 않는다.
- 서브계정 로그인 ID는 고객사 안에서만 유일하므로 자체 로그인은 `accountCode + loginId + password`를 받는다.
- 주문, 예치금, 공급사 등 모든 업무 데이터 접근에는 JWT의 `accountId`를 사용한다.

## 인증 결정사항

- 비밀번호는 Argon2id로 해시한다.
- Access JWT 기본 수명은 15분이다.
- Refresh JWT와 Redis 세션의 최대 수명은 7일이며 갱신으로 연장하지 않는다.
- Redis에는 Refresh Token 원문을 저장하지 않는다. SHA-256 해시만 저장한다.
- Access JWT만 검증하지 말고 Redis 세션 존재 여부도 확인한다.
- Refresh Token은 매번 회전한다. 동시 재사용이 감지되면 갱신을 거절한다.
- 브라우저 토큰은 HttpOnly, SameSite=Lax 쿠키로 전달한다.

## OAuth 결정사항

- 지원 제공자는 Google, Kakao, Naver다.
- OAuth `state`는 Redis에 10분 저장하고 콜백에서 한 번만 소비한다.
- OAuth 제공자의 고유 subject를 계정 연결 키로 사용한다.
- 메인 SSO 로그인은 고객사 코드를 받지 않는다. 한 사용자는 메인계정 하나만 가질 수 있다는 DB 제약으로 소속이 결정된다.
- 서브 SSO 로그인은 같은 사람이 여러 고객사에 속할 수 있으므로 `accountCode`를 반드시 받는다.
- SSO 전용 서브계정은 메인이 이메일과 제공자를 지정해 초대하고, 초대 이메일과 OAuth의 검증된 이메일이 일치할 때만 활성화한다.
- 자체 로그인 사용자가 SSO를 추가하면 해당 멤버십의 인증 방식은 `BOTH`가 된다.
- 이메일이 기존 사용자와 같다는 이유만으로 OAuth를 자동 연결하지 않는다. 계정 탈취를 막기 위해 로그인된 상태에서 명시적으로 연결하는 API가 필요하다.
- OAuth 콜백 URL에는 JWT를 붙이지 않는다. 쿠키를 설정한 뒤 `FRONTEND_URL/auth/callback`으로 이동한다.

## 개발 규칙

- 서버 비밀값은 `.env.local`에만 두고 `.env.example`에는 값 없이 이름만 유지한다.
- DB 변경 후 `npm run db:generate`로 SQL 마이그레이션을 커밋한다.
- Route Handler는 Zod로 입력을 검증하고 `jsonError` 형식을 유지한다.
- 인증이 필요한 API는 `requireAuth`를 사용한다.
- 고객사 데이터 쿼리에는 항상 `accountId` 조건을 넣는다.
- 작업 완료 전 `npm run lint`, `npm test`, `npm run build`를 실행한다.

## 현재 남은 작업

- 이메일 인증과 비밀번호 재설정
- 로그인 실패 횟수 증가 및 잠금 해제 정책
- OAuth 연결 해제 API와 인증 수단이 0개가 되지 않도록 하는 보호 규칙
- SSO 초대 재발송·취소 API와 실제 이메일 발송
- 권한 문자열의 중앙 카탈로그와 Route별 권한 검사
- 운영자(Admin) 인증 도메인 분리

## 2026-11-17 내 정보 API

- `GET /api/my-info` 한 번으로 프로필, 회사, 고객사 대표 연락처, 배송지, BEN 담당자, 로그인 수단과 화면 수정 권한을 반환한다.
- 회사 공용 정보 수정은 고객사 `MAIN/OWNER`만 가능하고, `SUB` 계정은 조회만 가능하다.
- 사업자등록번호는 소속 매핑 기준이므로 내 정보 API에서 수정할 수 없으며 응답에는 마스킹된 값만 포함한다.
- 대표 연락처는 `account_contacts`, 배송지는 `account_addresses`, BEN 담당자 프로필과 배정은 `ben_staff_profiles`, `account_manager_assignments`에 저장한다.
- 배송지는 고객사당 최대 20개이며 첫 배송지는 자동으로 기본 배송지가 된다. 기본 배송지는 다른 배송지를 기본으로 지정하기 전에는 삭제할 수 없다.
- 비밀번호 변경 성공 시 해당 회원의 Redis 세션을 모두 폐기하고 재로그인을 요구한다.
- 사업자등록증은 Object Storage 연동 전까지 응답의 `certificate`가 `null`이다.
- 계약과 요청/응답 형식은 `docs/openapi.yaml`의 `My Info` 태그를 기준으로 한다.

# BEN Backend Agent Notes

## 2026-11-23 초대코드 및 권한 변경 (현재 정책)

- SUB 가입/SSO 소속 신청은 `invitationCode`로 고객사를 선택한다. 사업자번호나 `accountCode`로 신청하지 않는다. SMS 및 MAIN의 승인/거절 흐름은 유지한다.
- `accounts.invitation_code`는 UNIQUE인 12자리 영문 대문자/숫자 난수. 기존 고객사는 데이터 이관 시 생성, 신규 고객사는 MAIN의 첫 조회에서 생성한다.
- `GET /api/account/invitation-code` 조회, `POST /api/account/invitation-code` 재발급. 해당 고객사 MAIN OWNER만 가능하며 운영자와 SUB는 불가. 이전 코드는 즉시 무효, 접수된 요청과 소속은 유지한다.
- 공개 권한은 `SUPER_ADMIN`(최고관리자), `ADMIN`(운영자), `MAIN`, `SUB`. `/api/auth/me`의 `accountRole`을 프론트 권한 표시에 사용한다. `systemRole`도 반환한다.
- 내부 DB/JWT 호환성: users.system_role은 USER/BEN_ADMIN/SUPER_ADMIN, membership type은 MAIN/SUB, 기존 role은 OWNER/MEMBER. BEN_ADMIN은 공개 ADMIN에 대응하며 기존 membership ADMIN은 신규 부여 금지 및 MEMBER로 이관한다.
- `PATCH /api/admin/users/{userId}/role`은 SUPER_ADMIN만 가능. 마지막 활성 최고관리자는 해제할 수 없다. 인증 API는 DB의 현재 권한을 확인하여 오래된 JWT로 권한을 유지할 수 없다.
- 배포 순서: `npm run db:migrate` → `node scripts/migrate-invitation-roles.mjs`. 활성 최고관리자가 없을 때 기존 활성 BEN_ADMIN이 정확히 1명인 경우에만 자동 승격한다. 여러 명이면 명시적으로 초기 최고관리자를 정해야 한다.
- 로컬 기존 `admin@ben-logistics.com`을 SUPER_ADMIN으로 승격했다. seed 재실행은 SUPER_ADMIN을 유지한다.
- 프론트는 별도 개발자 담당이므로 수정하지 않는다. 이번에 작성했던 프론트 변경은 전부 되돌렸다. 프론트 개발자가 SUB 가입/SSO 소속신청 입력을 invitationCode로 변경하고 MAIN 전용 초대코드 조회/재발급 API 및 accountRole을 연동해야 한다. 기존 프론트의 mainAccountCode 요청은 새 백엔드 계약과 호환되지 않는다.
- 테스트: `BEN_INVITATION_DB_TEST=1`로 실제 DB에서 MAIN/SUB 권한, 코드 교체, 이전 코드 차단, 대기 신청 보존 검증. `BEN_DEPOSIT_DB_TEST=1`로 예치금 회귀 테스트 포함.

## 예치금 API

- `src/lib/deposits` 아래 인증, 스키마, 저장소, CSV를 분리한다. 명세는 `docs/deposit-api.md`.
- MAIN/SUB 고객은 조회와 다운로드만 가능하다. 운영자 수기 입력은 DB의 BEN_ADMIN 또는 SUPER_ADMIN 역할 검증을 거친다.
- 금액은 numeric(18,2), 응답은 문자열. 원본을 보존하고 취소 거래로 정정한다.
- 요청키 중복 방지 및 고객사별 잠금으로 중복 등록/취소를 방지한다.
- 일정은 자동 차감하지 않는다. 송금 방법은 remittance_accounts 사전 데이터.
- PDF는 최대 2MB로 DB 저장하며 private object storage로 이전 가능하다.

## 2026-11-18 휴대폰 기반 가입 정책

- BEN 관리자가 고객사 메인계정을 발급하던 정책을 폐기하고, 사용자가 SMS 인증 후 직접 MAIN/OWNER와 고객사를 생성한다.
- `users.phone`은 전역 UNIQUE이며 인증 완료 시각은 `phone_verified_at`에 기록한다.
- SMS 코드는 Redis에 3분, 인증 성공 후 발급되는 1회용 검증 토큰은 10분 저장한다. 재발송은 60초, 검증 실패는 최대 5회다.
- SSO 신규 사용자는 공급자가 휴대폰번호를 제공하면 그대로 온보딩하고, 번호가 없으면 `SSO_SIGNUP` SMS 인증을 추가로 진행한다.
- SUB 자체가입은 사업자번호가 아니라 `invitationCode`로 대상 고객사를 선택해 가입 요청한다. MAIN/OWNER 승인 후 멤버십과 로컬 로그인 자격이 생성된다.
- Solapi 비밀값은 `.env.local`에만 두며 실제 발송 전 승인된 `SOLAPI_SENDER_NUMBER`가 필요하다.

## 이전 회원 정책 (폐기된 이력 — 신규 구현에 사용 금지)

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
- API 계약은 `docs/openapi.yaml`이다. 예치금 경로는 `deposit-openapi.json`을 상대 참조하므로 문서 공유 시 두 파일을 함께 제공한다. 상세 설명은 `docs/deposit-api.md`를 참조한다.

## 사용자 도메인 결정사항

- `User`는 사람의 신원이다. 고객사 데이터 경계는 `Account`다.
- 메인/서브계정은 `AccountMember.type`의 `MAIN`/`SUB`로 구분한다.
- `OWNER`는 메인계정, `ADMIN`과 `MEMBER`는 권한이 다른 멤버 역할이다.
- 고객사마다 메인계정은 DB 제약으로 최대 1개다. 신규 SUB는 가입 요청 후 MAIN/OWNER 승인을 받는다. 기존 직접 생성·초대 API는 호환용으로 남아 있다.
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
- 기존 SSO 초대 API는 이메일 일치 기반의 호환 경로이며 신규 가입 요청 화면에서는 사용하지 않는다.
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

- 공장·예치금 프론트 목업을 실제 API에 연결한다. 금액 문자열, next=null, 송금 계좌 빈 배열을 처리한다.
- SMS에 번호/IP별 일일 발송 제한과 동시 검증의 원자성 보강이 필요하다. 현재는 번호별 60초 제한과 5회 검증 제한이다.
- 기존 사용자 phone=null은 보존된다. phone UNIQUE는 값이 있는 사용자에만 적용되며 실명 기준 1인 1계정을 보장하지 않는다.
- 기존 직접 SUB 생성·초대 경로의 휴대폰 검증 정책 통합, LOCAL 승인 대기 사용자의 상태 조회/거절 후 재신청 흐름은 추가 작업이다.
- 예치금 PDF 실업무 데이터·스토리지 연결과 송금 계좌 사전 등록이 필요하다. 자동 입금 확인은 없다.
- 2026-11-18 검증: 린트/빌드 통과, 테스트 24개(DB 테스트 포함). SMS 실제 수신 확인. 예치금 고객사 분리·동시 중복·정정·권한 테스트 포함.

- 이메일 인증과 비밀번호 재설정
- 로그인 실패 횟수 증가 및 잠금 해제 정책
- OAuth 연결 해제 API와 인증 수단이 0개가 되지 않도록 하는 보호 규칙
- SSO 초대 재발송·취소 API와 실제 이메일 발송
- 권한 문자열의 중앙 카탈로그와 Route별 권한 검사
- 운영자(Admin) 인증 도메인 분리

## 2026-11-17 내 정보 API

- `GET /api/my-info` 한 번으로 프로필, 회사, 고객사 대표 연락처, 배송지, BEN 담당자, 로그인 수단과 화면 수정 권한을 반환한다.
- 회사 공용 정보 수정은 고객사 `MAIN/OWNER`만 가능하고, `SUB` 계정은 조회만 가능하다.
- 사업자등록번호는 회사 정보와 중복 확인용으로 유지되며 내 정보 API에서는 수정하지 않는다. 신규 소속 요청 기준은 invitationCode다.
- 대표 연락처는 `account_contacts`, 배송지는 `account_addresses`, BEN 담당자 프로필과 배정은 `ben_staff_profiles`, `account_manager_assignments`에 저장한다.
- 배송지는 고객사당 최대 20개이며 첫 배송지는 자동으로 기본 배송지가 된다. 기본 배송지는 다른 배송지를 기본으로 지정하기 전에는 삭제할 수 없다.
- 비밀번호 변경 성공 시 해당 회원의 Redis 세션을 모두 폐기하고 재로그인을 요구한다.
- 사업자등록증은 Object Storage 연동 전까지 응답의 `certificate`가 `null`이다.
- 계약과 요청/응답 형식은 `docs/openapi.yaml`의 `My Info` 태그를 기준으로 한다.

## 2026-11-18 공장 API

- 공장 공통 원장은 `factories`, 고객사별 거래 관계와 메모는 `account_factories`에 분리한다.
- 공장 목록·상세·이슈·파일은 JWT의 `accountId`와 `account_factories`를 함께 검사해 다른 고객사 데이터를 차단한다.
- 고객사별 지표와 차트 데이터는 `factory_metrics`, 이슈는 `factory_issues`, 파일 메타데이터는 `factory_files`에 저장한다.
- 공장 메모는 고객사 전용 정보이며 `OWNER` 또는 `ADMIN`만 수정한다.
- 주문·제품 이력은 향후 각 도메인의 원본 테이블에서 조회하고 공장 테이블에 중복 저장하지 않는다.
- API 코드는 `src/lib/factories` 아래 `schemas`, `repository`, `service`, `types`로 역할을 분리한다.

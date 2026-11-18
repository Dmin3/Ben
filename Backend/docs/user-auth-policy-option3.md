# 고객사 메인 계정 위임형 회원 정책

> 과거 정책 문서: 2026-11-18 휴대폰 기반 자가 가입으로 대체됨. 아래는 이력이며 신규 구현 기준이 아니다. 최신 정책은 ../Agent.md와 openapi.yaml 참조. 신규 메인은 SMS 후 직접 생성하며 SUB는 mainAccountCode로 신청한다.

## 가입 흐름

1. BEN 관리자가 고객사와 고객사당 하나의 MAIN/OWNER 계정을 먼저 등록한다.
2. 통합 SSO 최초 로그인 사용자는 `users`와 `oauth_identities`만 생성하고 30분짜리 온보딩 쿠키를 받는다.
3. 사용자는 사업자등록번호를 제출해 `membership_requests`를 생성한다.
4. 고객사 MAIN/OWNER가 승인하면 SUB 멤버십이 생성된다.
5. 승인된 사용자는 다음 SSO 로그인부터 일반 Access/Refresh JWT를 받는다.

## 정보 노출 방지

`accounts`에는 `business_number_hash`, `business_number_last4`, `member_limit`을 둔다. 사업자번호 조회는 서버 비밀키를 이용한 HMAC 값으로 수행한다. 소속 요청 API는 사업자번호가 고객사와 매칭되는지와 관계없이 동일한 `202 PENDING` 응답을 반환하며 회사명을 노출하지 않는다.

## API

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/onboarding/me` | 소속 없는 SSO 사용자와 최근 요청 상태 조회 |
| GET | `/api/onboarding/membership-requests` | 본인의 최근 소속 요청 조회 |
| POST | `/api/onboarding/membership-requests` | 사업자등록번호로 소속 요청 |
| GET | `/api/account/membership-requests` | MAIN/OWNER 승인 대기 목록 |
| POST | `/api/account/membership-requests/{requestId}/approve` | SUB 멤버십 생성 및 승인 |
| POST | `/api/account/membership-requests/{requestId}/reject` | 소속 요청 거절 |

## 시스템 관리자

`users.system_role`은 일반 고객사 사용자(`USER`)와 BEN 운영 관리자(`BEN_ADMIN`)를 구분한다. 고객사 `role=OWNER`와 BEN 시스템 관리 권한은 서로 다른 개념이다. 고객사 최초 생성 API는 `x-ben-admin-key`가 있어야 호출할 수 있다.

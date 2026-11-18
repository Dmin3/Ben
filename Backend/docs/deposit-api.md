# 예치금 API (CNY)
고객은 MAIN/SUB 모두 조회·다운로드만 가능하다. 모든 API는 기존 Bearer JWT 또는 인증 쿠키가 필요하다.
운영자 쓰기는 활성 BEN_ADMIN 사용자만 가능하며 SUB는 운영자 역할이 있어도 금지된다.
고객사 범위는 JWT accountId로 결정한다. 운영자 URL의 accountId는 UUID다.

## 고객
- GET /api/deposit: { summary: { balance, totalCharged, totalUsed, asOf, currency, next }, alerts, remittanceAccounts, invoices, capabilities }
- GET /api/deposit/transactions?type=all&period=3m&page=1&pageSize=10: { items, total, page, pageSize }
- GET /api/deposit/transactions/export: 같은 필터의 전체 CSV, 최대 10000건, UTF-8 BOM.
- GET /api/deposit/alerts?page=1&pageSize=10: { items, page, pageSize }
- GET /api/deposit/invoices/{id}/download: 본인 고객사 PDF만 첨부파일로 응답. 없거나 타사 파일은 404.

금액은 정확한 십진수 문자열이며 CNY 고정. 프론트 표시 단계에서 포맷한다.
거래 items는 id, date(YYYY-MM-DD), description, orderId(선택), amount, type(in/out), balance, reversalOf.
기간은 현재 DB 날짜 기준 3m/6m/1y/all, type은 all/in/out, pageSize는 1~100.
잔액은 기간 필터 전에 전체 거래의 거래일·등록시각·ID 순으로 계산한다.
요약 totalCharged/totalUsed는 정정 포함 전체 양수/음수 흐름 합계다.
asOf는 마지막 등록 시각(빈 내역은 null), next는 없으면 null.
알림 읽음 저장은 구현하지 않았으므로 unread 필드는 반환하지 않는다.
송금 계좌 미등록 시 빈 배열, 인보이스 미등록 시 빈 배열이다. 다운로드 버튼은 invoices 유무로 제어한다.

## BEN 운영자
공통 경로: /api/admin/accounts/{accountId}/deposit
- GET /transactions: 고객 거래 목록과 같은 쿼리
- POST /transactions: { amount: "10000.00", description: "TT 입금", occurredOn: "2026-11-18", orderCode?: "BEN-2026-001", requestKey: UUID }
- POST /transactions/{id}/reverse: { description: "금액 오입력 취소", occurredOn: "2026-11-18", requestKey: UUID }
- POST /schedules: { label: "출고 잔금", amount: "12000.00", dueOn: "2026-12-01" }
- PATCH /schedules/{id}: { status: "PENDING" | "COMPLETED" | "CANCELLED" }
- POST /alerts: { type: "correction" | "topup" | "confirmed", message: "...", link?: "history" | "invoice" }
- POST /invoices: multipart/form-data의 file(PDF, 최대 2MB)

등록 성공 201, 일정 상태 변경 200. 입력 오류 400, 미인증 401, 권한 없음 403, 타사/없는 리소스 404, 중복 취소·요청키 충돌 409.
입출금 원본 수정/삭제 API는 제공하지 않는다. 취소 거래를 추가한 후 올바른 금액의 새 거래를 등록한다.
동일 고객사 requestKey 재시도는 같은 내역을 반환하고, 내용이 다르면 409.
예정 완료는 잔액을 변경하지 않는다. 실제 출금은 운영자가 별도로 음수 거래를 등록한다.
현재 음수 잔액은 허용한다. 별도 잔액 조정 필드를 제공하지 않는다.
PDF는 private object storage 설정 전까지 DB base64로 보관하며 파일별 고객사 권한 확인 후 반환한다.

## 데이터
deposit_transactions / deposit_schedules / deposit_alerts / deposit_invoices / remittance_accounts.
remittance_accounts는 운영팀이 bank, swift, account, holder, address, active 값을 사전 등록한다.
프론트는 아직 목업 상태이며 위 응답 계약으로 연동해야 한다.

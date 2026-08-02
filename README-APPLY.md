# WorkLink Baseline 06 — Finance & Settlement

## Luồng

```text
Job COMPLETED
→ PREPARE settlement
→ REVIEW settlement
→ APPROVE settlement
→ phát sinh CUSTOMER_CHARGE và WORKER_PAYOUT
→ ghi nhận thanh toán
→ SETTLED
```

## Quy tắc tính

- Giá trị khách hàng gốc: `jobs.agreed_price`.
- Worker base payout: `assignments.agreed_payout`.
- Tăng ca theo đơn giá phút:
  `agreed_payout / planned_minutes`.
- Tăng ca chỉ tính khi work session đã được khách hàng xác nhận.
- Retention trừ vào khoản trả worker.
- Adjustment lưu thành dòng riêng, không sửa mất số gốc.
- Settlement chỉ lập khi Job `COMPLETED`.
- Mỗi Job có tối đa một Settlement đang hoạt động.

## API

```text
POST /api/jobs/:jobId/settlement/prepare
GET  /api/jobs/:jobId/settlement
POST /api/jobs/:jobId/settlement/adjustments
POST /api/jobs/:jobId/settlement/approve

POST /api/payments/:paymentId/mark-paid
POST /api/payments/:paymentId/fail

GET  /api/workers/:workerId/earnings
GET  /api/finance/settlements
```

## Áp dụng

```powershell
cd D:\Source\Git\WorkLink

pnpm --filter @worklink/api lint
pnpm check
pnpm --filter @worklink/api build
pnpm --filter @worklink/api db:migrate
pnpm --filter @worklink/api dev
```

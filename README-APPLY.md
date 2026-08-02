# WorkLink Baseline 05 — Job Execution

## Luồng vận hành

```text
Assignment CONFIRMED
  → CHECKED_IN / ACTIVE
  → CHECKED_OUT / WAITING_CONFIRMATION
  → COMPLETED
```

Cấp Job:

```text
ASSIGNED
  → IN_PROGRESS khi assignment đầu tiên check-in
  → COMPLETED khi toàn bộ assignment hợp lệ đã hoàn tất
```

Nhánh ngoại lệ:

```text
CONFIRMED / ACTIVE
  → NO_SHOW
  → CANCELLED
  → REPLACEMENT_REQUIRED
```

## API

```text
GET  /api/jobs/:jobId/execution
GET  /api/assignments/:assignmentId/execution

POST /api/assignments/:assignmentId/check-in
POST /api/assignments/:assignmentId/evidence
POST /api/assignments/:assignmentId/incidents
POST /api/assignments/:assignmentId/check-out
POST /api/assignments/:assignmentId/customer-confirm
POST /api/assignments/:assignmentId/no-show
POST /api/assignments/:assignmentId/cancel
POST /api/assignments/:assignmentId/request-replacement
```

## Quy tắc

- Chỉ worker đúng assignment được check-in/check-out.
- Check-in phải nằm trong bán kính cho phép, mặc định 500 m.
- Có thể check-in sớm tối đa 60 phút.
- Check-in trễ được ghi nhận vào nhật ký.
- Check-out tính `actualMinutes`.
- `overtimeMinutes` tính từ thời gian thực tế vượt thời lượng kế hoạch.
- Khách hàng xác nhận mới hoàn tất assignment.
- Khi tất cả assignment hoàn tất, job chuyển `COMPLETED`.
- Hủy/no-show có thể mở yêu cầu thay người.

## Áp dụng

```powershell
cd D:\Source\Git\WorkLink

pnpm --filter @worklink/api lint
pnpm check
pnpm --filter @worklink/api db:migrate
pnpm --filter @worklink/api dev
```

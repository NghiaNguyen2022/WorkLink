# WorkLink Baseline 08 — Exceptions, Replacement & Disputes

## Phạm vi

### 1. Cancellation / No-show assessment

- Đánh giá theo số phút còn lại trước giờ bắt đầu.
- Lưu policy version.
- Tính phí khách hàng, bồi thường worker và phí nền tảng.
- Không ghi đè payment gốc.
- Có audit log.

### 2. Replacement workflow

- Mở yêu cầu thay người từ assignment bị hủy/no-show.
- Chọn worker thay thế.
- Tạo assignment mới với `replacementForAssignmentId`.
- Đóng request khi assignment thay thế được tạo.

### 3. Dispute / Refund adjustment

- Mở support case loại `COMPLAINT` hoặc `DISPUTE`.
- Ghi timeline xử lý.
- Phê duyệt adjustment.
- Sinh payment mới loại `CUSTOMER_REFUND` hoặc `WORKER_ADJUSTMENT`.
- Không sửa/xóa payment cũ.

### 4. Operations Web

- Exception Overview trong Job Detail.
- Form đánh giá hủy.
- Danh sách replacement requests.
- Danh sách dispute cases và refund adjustments.

## Áp dụng

```powershell
cd D:\Source\Git\WorkLink
node scripts/apply-baseline-08.mjs

pnpm --filter @worklink/api db:migrate
pnpm --filter @worklink/api typecheck
pnpm --filter @worklink/api build

pnpm --filter @worklink/operations-web typecheck
pnpm --filter @worklink/operations-web build
```

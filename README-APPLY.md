# WorkLink Baseline 07.2 — Relationship Matching & Quality UI

## Phạm vi

### Backend

- Quan hệ `BLOCKED` là hard filter trong Matching.
- Quan hệ `PREFERRED` cộng tối đa 5 điểm.
- Lưu rule version `RELATIONSHIP_V1`.
- API đọc metric snapshot theo Review.
- API tổng quan chất lượng theo Job.
- API đọc lịch sử Re-hire đã có được đưa lên Operations Web.

### Operations Web

- Review moderation.
- Metric trước/sau.
- Danh sách quan hệ hiện tại.
- Lịch sử Re-hire.
- Hiển thị rule Matching.

## Cách áp dụng

Giải nén vào thư mục gốc WorkLink.

Chạy script patch một lần:

```powershell
cd D:\Source\Git\WorkLink
node scripts/apply-baseline-07-2.mjs
```

Sau đó:

```powershell
pnpm --filter @worklink/api typecheck
pnpm --filter @worklink/api build

pnpm --filter @worklink/operations-web typecheck
pnpm --filter @worklink/operations-web build
```

Script sẽ dừng nếu không tìm thấy đúng đoạn source cần patch. Khi đó không có
file nào bị sửa một phần.

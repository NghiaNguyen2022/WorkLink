# WorkLink Baseline 03.1 — MySQL Migration Fix

Sửa lỗi `DELIMITER` khi chạy migration qua `mysql2`.

- Thêm cột bằng TypeScript + `information_schema`
- Không dùng stored procedure
- Không dùng `DELIMITER`
- File SQL chỉ tạo bảng mới
- Có thể chạy lại nhiều lần

Áp dụng:

```powershell
cd D:\Source\Git\WorkLink

pnpm --filter @worklink/api lint
pnpm --filter @worklink/api db:migrate
```

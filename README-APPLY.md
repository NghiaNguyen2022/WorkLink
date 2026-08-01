# WorkLink Baseline 02.2 — Unified Database Access

Bản patch này chuẩn hóa backend về một cách truy cập database duy nhất:

```text
Business Service
    ↓ inject
DatabaseService
    ↓
Drizzle MySQL
    ↓
mysql2 Pool
```

## Quy tắc bắt buộc

Ngoài thư mục `src/database`, source nghiệp vụ không được:

- import `mysql2`
- import `drizzle-orm/mysql2`
- inject token `DATABASE`
- inject token `MYSQL_POOL`
- gọi `createPool()`
- tự tạo kết nối MySQL

Các module nghiệp vụ chỉ inject:

```ts
constructor(private readonly database: DatabaseService) {}
```

và truy vấn qua:

```ts
this.database.db
```

## Áp dụng

Chép toàn bộ nội dung gói này vào thư mục gốc WorkLink và ghi đè file trùng.

Sau đó:

```powershell
cd D:\Source\Git\WorkLink

pnpm --filter @worklink/api lint
pnpm check
pnpm --filter @worklink/api build
```

Rà soát truy cập database:

```powershell
powershell -ExecutionPolicy Bypass -File apps\api\scripts\audit-database-access.ps1
```

Kết quả đúng:

```text
PASS: Database access is centralized through DatabaseService.
```

Chạy API:

```powershell
pnpm --filter @worklink/api dev
```

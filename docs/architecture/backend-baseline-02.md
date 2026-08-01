# Backend Baseline 02 — MySQL

`apps/api` là modular monolith. Mỗi domain có controller/service/module riêng; truy cập dữ liệu đi qua `DatabaseService`.

## Data stack

- MySQL 8.4
- `mysql2/promise`
- Drizzle ORM với dialect `mysql`
- UUID được lưu trong `varchar(36)`
- Các danh sách động ban đầu dùng cột `JSON`

Schema và migration tạm nằm trong `apps/api` để backend build độc lập. Khi các domain ổn định, database schema có thể được tách sang `packages/database` ở baseline sau.

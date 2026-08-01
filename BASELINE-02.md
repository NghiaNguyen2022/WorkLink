# WorkLink Baseline 02 — Backend API dùng MySQL

## Công nghệ

- NestJS modular monolith cho `apps/api`.
- MySQL 8.4 + Drizzle ORM + driver `mysql2`.
- Redis 7 được chuẩn bị cho queue/notification ở baseline sau.
- Swagger/OpenAPI tại `/api/docs`.
- Modules: health, auth, users, customers, workers.

## Khởi động

```powershell
Copy-Item .env.example .env
docker compose up -d
pnpm install
pnpm --filter @worklink/api db:migrate
pnpm --filter @worklink/api db:seed
pnpm --filter @worklink/api dev
```

## Kiểm tra

- `GET http://localhost:4000/api/health`
- Swagger: `http://localhost:4000/api/docs`
- Login: `POST /api/auth/login`
- `GET /api/users`
- `GET /api/customers`
- `GET /api/workers`

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@worklink.local` | `Admin@123` |
| Điều phối | `operator@worklink.local` | `Admin@123` |
| Khách hàng | `customer@worklink.local` | `Admin@123` |
| Người lao động | `worker@worklink.local` | `Admin@123` |

## Ghi chú dữ liệu

- ID được lưu dưới dạng `varchar(36)` để chứa UUID.
- Danh sách kỹ năng và khu vực phục vụ dùng kiểu `JSON` của MySQL.
- Thời gian được lưu ở UTC; ứng dụng chịu trách nhiệm hiển thị theo `Asia/Ho_Chi_Minh`.
- Script seed có thể chạy lại nhiều lần mà không tạo dữ liệu trùng.

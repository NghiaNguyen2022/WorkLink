# WorkLink Baseline 01

## Mục tiêu

Chuẩn hóa monorepo để tất cả app/package có cấu trúc thống nhất, có lệnh build, typecheck, test và lint.

## Chạy local

```bash
corepack enable
pnpm install
pnpm check
pnpm dev
```

API mặc định chạy tại `http://localhost:4000`; endpoint kiểm tra: `/health`.

## Phạm vi đã dựng

- API Node/TypeScript có health check và endpoint mock jobs/workers.
- Customer Web, Operations Web, Mobile App và Public Website có entry point mock.
- Shared types, validation, business rules, pricing engine, matching engine và API client có code nền.
- Bộ test tối thiểu cho pricing và matching.

## Chưa thuộc baseline này

- Chưa tích hợp NestJS, React, Expo, PostgreSQL hoặc Redis.
- Chưa có xác thực thật, migration DB và giao diện hoàn chỉnh.

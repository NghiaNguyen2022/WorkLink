# Workforce Platform Monorepo

Nền tảng kết nối và điều phối nhân sự làm việc theo giờ.

## Thành phần

- `apps/api`: Backend API theo Modular Monolith.
- `apps/customer-web`: Web dành cho người thuê.
- `apps/operations-web`: Portal tổng đài, điều phối, quản trị và tài chính.
- `apps/mobile-app`: Một codebase mobile phân vai người thuê/người lao động.
- `apps/public-website`: Website công khai và SEO.
- `packages/*`: Database, type, validation, business rules, pricing, matching và thư viện dùng chung.
- `infrastructure`: Docker, Nginx, deployment và monitoring.
- `docs`: Tài liệu nghiệp vụ và kỹ thuật.
- `tests`: Kiểm thử liên ứng dụng.

## Bắt đầu

```bash
corepack enable
pnpm install
pnpm dev
```

Đây là scaffold ban đầu. Các file mock trong từng khu vực chỉ phục vụ phát triển và demo.

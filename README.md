# WorkLink

Nền tảng kết nối và điều phối nhân sự làm việc theo giờ, tổ chức theo monorepo.

## Workspace

- `apps/api`: Backend API.
- `apps/customer-web`: Cổng người thuê.
- `apps/operations-web`: Tổng đài và điều phối.
- `apps/mobile-app`: Ứng dụng mobile cho khách hàng và người lao động.
- `apps/public-website`: Website công khai.
- `packages/*`: Kiểu dữ liệu, validation, business rules, pricing, matching và thư viện dùng chung.

## Khởi động

```bash
corepack enable
pnpm install
pnpm check
pnpm dev
```

Xem [BASELINE.md](./BASELINE.md) để biết phạm vi hiện tại.

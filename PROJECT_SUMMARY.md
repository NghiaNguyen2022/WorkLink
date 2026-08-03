# WORKLINK PROJECT SUMMARY

## Điều chỉnh kiến trúc frontend

Ngày 2026-08-02, gói FE đầu tiên đã tạo nhầm `apps/web`.
Thư mục này không thuộc kiến trúc WorkLink và phải được xóa.

Phân vai chuẩn:

- `operations-web`: điều phối, quản trị, kiểm soát và moderation.
- `customer-web`: giao diện người thuê.
- `mobile-app`: giao diện người lao động.
- `public-website`: nội dung công khai.

## Baseline 07 hiện tại

Backend đã triển khai:

1. Review hai chiều.
2. Metric worker/customer có idempotency.
3. Preferred, Neutral và Blocked.
4. Re-hire.
5. Moderation và audit.

Operations Web đã triển khai:

1. App shell.
2. Dashboard vận hành.
3. Job list và Job detail.
4. Review UI phục vụ vận hành/UAT.
5. Relationship actions.
6. Re-hire form.
7. Responsive states.

## Việc kế tiếp

1. UAT Operations Web.
2. Tích hợp BLOCKED và PREFERRED vào Matching.
3. Dựng customer self-service trong `customer-web`.
4. Dựng worker review trong `mobile-app`.


## 2026-08-02 — Baseline 07.2

Đã hoàn tất phần tích hợp còn lại của nhóm chất lượng:

- BLOCKED được đưa vào hard filter của Matching.
- PREFERRED được cộng tối đa 5 điểm.
- Matching rule được version hóa bằng RELATIONSHIP_V1.
- Operations Web có Review moderation.
- Operations Web hiển thị metric snapshot trước/sau.
- Operations Web hiển thị relationship và Re-hire history.

Baseline 07 chuyển sang trạng thái IMPLEMENTED — chờ UAT end-to-end.


## 2026-08-02 — Baseline 08

Đã triển khai nhóm ngoại lệ:

- Cancellation/no-show policy CANCELLATION_V1.
- Customer fee và worker compensation.
- Replacement request và assignment thay thế.
- Complaint/dispute timeline.
- Financial adjustment sinh payment mới.
- Operations Web exception overview.

Baseline 08 ở trạng thái IMPLEMENTED — chờ UAT.

## 2026-08-02 — Baseline 10

Đã triển khai Reporting, Risk và Operations Dashboard:

- KPI vận hành.
- KPI tài chính.
- KPI chất lượng.
- Risk indicators.
- Monthly trend.
- CSV export.
- Dashboard và Reports page.

Baseline 10 ở trạng thái IMPLEMENTED — chờ UAT.

## 2026-08-02 — Baseline 11

Đã triển khai Customer Portal vertical slice:

- Customer-scoped API.
- Dashboard.
- Job creation/tracking.
- Quote approval.
- Assignment execution tracking.
- Completion confirmation.
- Payment view.
- Review, Preferred, Re-hire và Complaint.
- React/Vite Customer Web tại port 5175.

Baseline 11 ở trạng thái IMPLEMENTED — chờ UAT và JWT/RBAC.

## 2026-08-03 — Baseline 12: Auth/RBAC Foundation

Đã phát hiện và khắc phục lỗ hổng nghiêm trọng: API cấp JWT khi đăng
nhập nhưng không có guard nào kiểm tra token, và `customer-portal` nhận
`customerId`/`customerUserId` trực tiếp từ client — cho phép giả mạo
danh tính khách hàng bất kỳ.

Backend:

- `packages/auth`: chuẩn hóa `AppRole` (9 vai trò, khớp
  `docs/security/access-control.md`), `AuthUser`, `JwtPayload`.
- `JwtAuthGuard` + `RolesGuard` đăng ký toàn cục (`APP_GUARD`) trong
  `AuthModule`, có `@Public()` cho `auth/login`, `auth/register`,
  `health`.
- `POST auth/register` (CUSTOMER hoặc WORKER, tự tạo customer/worker
  profile), phản hồi kèm `profileId`.
- `customer-portal`: `customerUserId` không còn nhận từ client — lấy
  từ JWT đã xác thực (`req.user`); sai chủ sở hữu `customerId` trả về
  403 thay vì 400.
- Toàn bộ endpoint khác (jobs, workers, matching, execution, finance,
  quality, reporting, exceptions...) mặc định yêu cầu JWT hợp lệ.

Frontend:

- `customer-web`: đăng nhập/đăng ký thật (JWT), bỏ ô nhập
  Customer ID/User ID thủ công; `customerId` lấy từ `profileId` sau
  đăng nhập; `lib/api.ts` gắn `Authorization` header và tự đăng xuất
  khi nhận 401.
- `operations-web`: thêm trang đăng nhập + `OperatorSessionProvider`
  (trước đây hoàn toàn chưa có auth); `lib/api.ts` gắn
  `Authorization` header tương tự.

Đã smoke test bằng curl với DB thật: không token → 401; token đúng
khách hàng → 200; token đúng nhưng sai `customerId` → 403; token sai
vai trò (WORKER gọi customer-portal) → 403; đăng ký mới → nhận JWT +
`profileId` hợp lệ.

Baseline 12 ở trạng thái IMPLEMENTED — chờ UAT. Các bước kế tiếp theo
BPRD: song song hóa Track A (Worker Portal API + Worker Mobile App
Expo), Track B (nốt 3 form Operations Web), Track C (profile/location
picker cho Customer Web); Track D (Public Website) để sau.

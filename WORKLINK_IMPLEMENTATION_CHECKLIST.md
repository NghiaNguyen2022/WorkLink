# WORKLINK IMPLEMENTATION CHECKLIST

> Nguồn chuẩn: BPRD WorkLink v1.1.
> Cập nhật append-only.

## Kiến trúc ứng dụng

- [x] `apps/api`: Backend API.
- [x] `apps/operations-web`: Điều phối, quản trị, kiểm soát chất lượng.
- [ ] `apps/customer-web`: Cổng tự phục vụ người thuê.
- [ ] `apps/mobile-app`: Ứng dụng người lao động.
- [ ] `apps/public-website`: Website công khai.
- [x] Không tạo thêm `apps/web`.
- [x] Đã loại bỏ định hướng thư mục frontend chung bị trùng vai trò.

## Trạng thái baseline

| Baseline | Backend | Operations Web | Customer Web | Mobile | Trạng thái |
|---|---|---|---|---|---|
| 01–05 | PASS | Chưa dựng | Chưa dựng | Chưa dựng | PASS |
| 06 | Implemented | Chưa dựng | Chưa dựng | Chưa dựng | Chờ UAT |
| 07 | Implemented | Implemented | Planned | Planned | Chờ UAT |

## Baseline 07 — Operations Web

- [x] React + TypeScript + Vite trong `apps/operations-web`.
- [x] App shell.
- [x] Sidebar.
- [x] Header và breadcrumb.
- [x] API client.
- [x] TanStack Query.
- [x] Job list.
- [x] Job detail.
- [x] Assignment summary.
- [x] Review form phục vụ UAT/vận hành.
- [x] Review history.
- [x] Relationship actions.
- [x] Re-hire form.
- [x] Loading/error/empty state.
- [x] Responsive UI.
- [x] Authentication context (Baseline 12).
- [ ] RBAC theo vai trò trên UI (route-level, chưa phân trang theo role).
- [ ] Review moderation UI.
- [ ] Metric before/after card.
- [ ] Relationship oversight list.
- [ ] Re-hire history.
- [ ] Matching hard filter BLOCKED.
- [ ] Matching preferred bonus.

## Baseline 07 — Customer Web

- [ ] Danh sách Job của khách hàng.
- [ ] Customer review worker.
- [ ] Preferred/Blocked self-service.
- [ ] Re-hire self-service.
- [ ] Lịch sử thuê lại.

## Baseline 07 — Mobile App

- [ ] Worker review customer.
- [ ] Đánh giá điều kiện làm việc.
- [ ] Worker-side Preferred/Blocked.
- [ ] Xem metric cá nhân.

## UAT

- [ ] Operations Web chạy port 5174.
- [ ] Job list tải từ API.
- [ ] Job detail tải từ API.
- [ ] Review thành công.
- [ ] Preferred/Blocked thành công.
- [ ] Re-hire tạo Job DRAFT.
- [ ] Không còn thư mục `apps/web`.


## Baseline 07.2 — Relationship Matching & Quality UI

### Matching

- [x] BLOCKED là hard filter.
- [x] BLOCKED từ một trong hai phía đều loại Worker.
- [x] PREFERRED cộng tối đa 5 điểm.
- [x] Tổng điểm sau bonus không vượt 100.
- [x] Score breakdown có relationshipBonus.
- [x] Reasons ghi nhận quan hệ ưu tiên.
- [x] Matching run lưu rule version RELATIONSHIP_V1.
- [ ] UAT Worker BLOCKED không xuất hiện.
- [ ] UAT Worker PREFERRED được cộng đúng 5 điểm.
- [ ] UAT hard filters vẫn ưu tiên hơn bonus.

### Quality Operations UI

- [x] Review moderation UI.
- [x] Publish, Flag và Hide.
- [x] Bắt buộc nhập actor và lý do phía API.
- [x] Quality overview API.
- [x] Metric before/after.
- [x] Relationship list.
- [x] Re-hire history.
- [x] Matching rule display.
- [ ] UAT moderation ghi Audit Log.
- [ ] UAT snapshot hiển thị đúng.


## Baseline 08 — Exceptions, Replacement & Disputes

### Cancellation / No-show

- [x] Policy version CANCELLATION_V1.
- [x] Tính theo thời gian trước giờ bắt đầu.
- [x] Customer cancellation fee.
- [x] Worker compensation.
- [x] Platform fee.
- [x] Approval trước khi sinh payment.
- [x] Không sửa payment gốc.
- [ ] UAT các mốc 24h, 4h, 1h và dưới 1h.

### Replacement

- [x] Mở replacement request.
- [x] Chỉ từ assignment no-show/cancelled/replacement-required.
- [x] Chọn worker mới.
- [x] Chặn worker trùng Job.
- [x] Tạo assignment mới.
- [x] Liên kết replacementForAssignmentId.
- [ ] UAT assignment thay thế.

### Dispute / Adjustment

- [x] Mở complaint/dispute.
- [x] Timeline sự kiện.
- [x] Evidence.
- [x] Update trạng thái.
- [x] Propose financial adjustment.
- [x] Approve adjustment.
- [x] Sinh payment mới.
- [x] Không xóa payment cũ.
- [ ] UAT refund/adjustment end-to-end.

### Operations Web

- [x] Exception overview.
- [x] Cancellation assessment action.
- [x] Replacement request action.
- [x] Danh sách dispute và adjustment.
- [ ] Form mở dispute đầy đủ.
- [ ] Form fulfill replacement.
- [ ] Form approve adjustment.

# Baseline 10 — Reporting, Risk & Dashboard

## Đã triển khai

- [x] Dashboard KPI API.
- [x] Bộ lọc from/to.
- [x] Fill rate.
- [x] Offer acceptance rate.
- [x] Average time-to-fill.
- [x] No-show và cancellation rate.
- [x] Check-in delta.
- [x] Payout SLA.
- [x] Settlement variance.
- [x] Review và dispute metrics.
- [x] Certificate expiry.
- [x] Risk alerts.
- [x] CSV export.
- [x] Operations Dashboard.
- [x] Reports page.

## Chưa hoàn tất/UAT

- [ ] UAT KPI bằng dữ liệu thật.
- [ ] Xác nhận công thức KPI.
- [ ] UAT Risk Alert.
- [ ] UAT CSV trên Excel.
- [ ] Phân quyền báo cáo.

## Baseline 10.2 — Training Schema Export Fix

- [x] Export schema training trong database/schema/index.ts.
- [x] Khôi phục các export workerCertificates và workerBadges.
- [x] Khôi phục export trainingCourses, enrollments, assessments.
- [x] ReportingController không phụ thuộc @types/express.
- [ ] Chạy lại API typecheck.
- [ ] Chạy lại API build.

# Baseline 11 — Customer Web

## Đã triển khai

- [x] Customer Portal API riêng.
- [x] Kiểm tra Job thuộc Customer.
- [x] Customer Dashboard.
- [x] Customer Job List.
- [x] Customer Job Detail.
- [x] Tạo Job Draft.
- [x] Gửi Job xác minh.
- [x] Duyệt báo giá.
- [x] Xem Worker Assignment.
- [x] Xem Check-in/Check-out.
- [x] Xác nhận hoàn tất.
- [x] Xem Payment.
- [x] Review Worker.
- [x] Preferred Worker.
- [x] Re-hire.
- [x] Complaint.
- [x] React/Vite Customer Web.
- [x] Responsive UI.

## Chưa hoàn tất/UAT

- [x] JWT Authentication (Baseline 12).
- [ ] Customer Profile UI.
- [ ] Location Management UI.
- [ ] Category picker thay cho nhập ID.
- [ ] Location picker thay cho nhập ID.
- [ ] Requirement builder.
- [ ] Payment gateway.
- [ ] Blocked action trên UI.
- [ ] Dispute detail/status.
- [ ] UAT toàn bộ Customer journey.

## Baseline 11.1 — Pricing Quote Field Fix

- [x] Đồng bộ pricingQuotes.quoteStatus.
- [x] Đồng bộ pricingQuotes.customerTotal.
- [x] Dùng acceptedAt thay approvedAt.
- [x] Lưu acceptedByUserId.
- [x] Customer Web hiển thị quoteStatus.
- [x] Customer Web hiển thị customerTotal.
- [x] Chạy lại API typecheck.
- [x] Chạy lại Customer Web typecheck.

## Baseline 12 — Auth/RBAC Foundation

### Phát hiện

- [x] Xác định JWT được cấp nhưng không được xác thực ở bất kỳ route nào.
- [x] Xác định `customer-portal` nhận `customerId`/`customerUserId` từ client, không xác minh danh tính.

### Backend

- [x] Chuẩn hóa `AppRole` trong `packages/auth` (9 vai trò, khớp `docs/security/access-control.md`).
- [x] `JwtAuthGuard` + `RolesGuard` đăng ký toàn cục qua `APP_GUARD`.
- [x] `@Public()` decorator cho auth/login, auth/register, health.
- [x] `@Roles()` decorator + `@CurrentUser()` decorator.
- [x] `POST auth/register` (CUSTOMER/WORKER), tự tạo customer/worker profile, trả về `profileId`.
- [x] `customer-portal`: customerUserId lấy từ JWT, không còn nhận từ client.
- [x] `customer-portal`: sai chủ sở hữu customerId trả về 403 (ForbiddenException).
- [x] Toàn bộ endpoint khác mặc định yêu cầu JWT hợp lệ.

### Frontend

- [x] `customer-web`: đăng nhập/đăng ký thật, bỏ nhập Customer ID/User ID thủ công.
- [x] `customer-web`: `lib/api.ts` gắn Authorization header, tự đăng xuất khi 401.
- [x] `operations-web`: thêm trang đăng nhập + `OperatorSessionProvider` (trước đây chưa có).
- [x] `operations-web`: `lib/api.ts` gắn Authorization header, tự đăng xuất khi 401.

### Verify

- [x] `pnpm --filter @worklink/api typecheck` + `build`.
- [x] `pnpm --filter @worklink/customer-web typecheck`.
- [x] `pnpm --filter @worklink/operations-web typecheck`.
- [x] Smoke test với DB thật: không token → 401; đúng khách hàng → 200; sai customerId → 403; sai vai trò → 403; đăng ký mới → JWT + profileId hợp lệ.
- [ ] UAT đăng nhập/đăng ký trên trình duyệt thật.
- [ ] Phân quyền chi tiết theo vai trò cho từng endpoint Operations (mới có yêu cầu "đã đăng nhập", chưa gắn `@Roles()` theo từng nghiệp vụ).

## Baseline 13 — Kế hoạch song song tiếp theo (theo BPRD §19.2)

- [ ] Track A: Worker Portal API (`apps/api/src/modules/worker-portal`) + Worker Mobile App (Expo/React Native).
- [ ] Track B: Operations Web — form mở dispute, fulfill replacement, approve adjustment; `@Roles()` theo từng endpoint.
- [ ] Track C: Customer Web — Profile UI, Location management UI, category/location picker, dispute detail/status.
- [ ] Track D (sau): Public Website (Next.js), theo giai đoạn Pilot của BPRD.

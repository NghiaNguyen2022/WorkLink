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

- [x] Worker review customer (Baseline 13.2 — màn hình trên `AssignmentDetailScreen` khi assignment `COMPLETED`).
- [ ] Đánh giá điều kiện làm việc (tách biệt khỏi review khách hàng — chưa làm).
- [x] Worker-side Preferred/Blocked (Baseline 13.2).
- [x] Xem metric cá nhân (Baseline 13.4).

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
- [x] Customer Profile UI (Track C, Baseline 13).
- [x] Location Management UI (Track C, Baseline 13).
- [x] Category picker thay cho nhập ID (Track C, Baseline 13).
- [x] Location picker thay cho nhập ID (Track C, Baseline 13).
- [x] Requirement builder (Baseline 13.3).
- [ ] Payment gateway.
- [x] Blocked action trên UI (Baseline 13.2 — nút "Chặn Worker" trên Job Detail, dùng chung endpoint relationships với PREFERRED).
- [x] Dispute detail/status (Track C, Baseline 13, read-only list trên Job Detail).
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

- [x] Track A: Worker Portal API (`apps/api/src/modules/worker-portal`) + Worker Mobile App (Expo/React Native).
- [x] Track B: Operations Web — form mở dispute, fulfill replacement, approve adjustment.
- [x] Track C: Customer Web — Profile UI, Location management UI, category/location picker, dispute detail/status.
- [ ] Track D (sau): Public Website (Next.js), theo giai đoạn Pilot của BPRD.
- [x] `@Roles()` chi tiết theo từng endpoint Operations (Baseline 13.1).

### Baseline 13.1 — RBAC chi tiết cho Operations API

Trước đây mọi endpoint ngoài `customer-portal`/`worker-portal` chỉ yêu
cầu "đã đăng nhập" (bất kỳ vai trò nào), do `RolesGuard` cho qua khi
route không khai báo `@Roles()`. Đã gắn `@Roles()` cho toàn bộ
controller nội bộ còn lại:

- [x] `jobs.controller.ts`: `job-categories` giữ nguyên mở cho mọi vai
  trò đã đăng nhập (khách hàng cần dùng khi tạo Job); các route còn
  lại (list/detail/create/update/submit/verify/quote/cancel...) giới
  hạn theo `CALL_CENTER/OPERATOR/VERIFIER/FINANCE/RISK_MANAGER/ADMIN`
  tùy hành động.
- [x] `matching.controller.ts`, `execution.controller.ts`,
  `quality.controller.ts`, `quality-insights.controller.ts`: toàn bộ
  route là nội bộ vận hành (worker/customer thao tác qua
  `worker-portal`/`customer-portal` gọi thẳng service, không qua HTTP
  của các controller này) — giới hạn cho nhóm vai trò nội bộ.
- [x] `reporting.controller.ts`: `OPERATOR/FINANCE/RISK_MANAGER/ADMIN`.
- [x] `finance.controller.ts`: tách read (`OPERATOR/FINANCE/RISK_MANAGER/ADMIN`)
  và hành động sinh/duyệt tiền (`FINANCE/ADMIN`).
- [x] `exceptions.controller.ts`: tách read, hành động khởi tạo
  (`CALL_CENTER/OPERATOR/RISK_MANAGER/ADMIN`), và phê duyệt tài chính
  (`cancellation-assessments/:id/approve`, `financial-adjustments/:id/approve`
  → `FINANCE/RISK_MANAGER/ADMIN`).
- [x] `customers.controller.ts`, `workers.controller.ts`: danh sách nội
  bộ, giới hạn cho nhóm vai trò nội bộ.
- [x] `users.controller.ts`: chỉ `ADMIN` (danh sách toàn bộ tài khoản).
- [x] `pnpm --filter @worklink/api typecheck` + `build` pass.
- [x] Smoke test qua curl với DB thật, đủ 4 vai trò (admin/operator/
  customer/worker): operator truy cập đúng toàn bộ endpoint ops đang
  dùng bởi `operations-web`; customer/worker bị 403 khi gọi endpoint
  ops; `job-categories` vẫn mở cho customer/worker; `users` chỉ admin
  mới vào được (operator 403); `financial-adjustments/:id/approve`
  operator bị 403, admin qua được vòng kiểm tra vai trò;
  `customer-portal`/`worker-portal` không bị ảnh hưởng (regression
  check).

### Track C — chi tiết

- [x] `customer-portal`: `GET/PATCH profile` (displayName, companyName, phone), ownership qua `assertCustomer`.
- [x] `customer-portal`: `GET/POST/PATCH locations` (customer_locations CRUD, chỉ chủ sở hữu).
- [x] `customer-web`: trang Hồ sơ (`/profile`) và Địa điểm (`/locations`) + nav sidebar.
- [x] `customer-web`: `CreateJobPage` dùng dropdown cho category (`GET /job-categories`, đã có sẵn ở `JobsController`) và location (danh sách của khách hàng).
- [x] `customer-portal`: `jobDetail` trả thêm `disputes` (support cases theo job, từ `ExceptionsService.overview`), hiển thị lịch sử khiếu nại read-only trên `JobDetailPage`.
- [x] `pnpm --filter @worklink/api typecheck` và `pnpm --filter @worklink/customer-web typecheck` pass.
- [x] Smoke test thủ công qua curl với DB thật (seed `customer@worklink.local`): login, GET/PATCH profile, GET/POST locations, GET job-categories, GET job detail có `disputes`, 401/403/404 đúng theo kỳ vọng.
- [ ] UAT trên trình duyệt thật.

### Track B — chi tiết

- [x] Form Fulfill Replacement (dropdown request `OPEN`, nhập workerId, payout, retention) → `POST replacement-requests/:id/fulfill`.
- [x] Form Open Dispute (caseType, priority, subject, description) → `POST jobs/:jobId/disputes`.
- [x] Form Approve Adjustment (dropdown adjustment `PROPOSED`) → `POST financial-adjustments/:id/approve`.
- [x] `apps/operations-web/src/services/exceptions.ts` — service wrapper mới, cùng convention `jobsApi`/`reportingApi`.
- [x] Gắn vào `ExceptionOverviewPanel.tsx` hiện có trên Job Detail.
- [x] `pnpm --filter @worklink/operations-web typecheck` pass.
- [x] Smoke test end-to-end qua trình duyệt thật: replacement `OPEN → FULFILLED` (tạo assignment mới), dispute xuất hiện đúng trong danh sách case, adjustment `PROPOSED → APPROVED` (sinh payment mới).

### Track A — chi tiết

- [x] `apps/api/src/modules/worker-portal`: mirror pattern `customer-portal` — `@Roles('WORKER')`, `@CurrentUser()`, `assertWorker(workerId, workerUserId)` ownership check (403 khi sai chủ sở hữu).
- [x] Endpoints: dashboard, profile (GET/PATCH), availability (CRUD), skills/certificates (read-only), offers (list + respond — ủy quyền `MatchingService.respond` sau khi xác minh offer thuộc đúng worker), assignments (list/detail + check-in/check-out/evidence/incidents — ủy quyền `ExecutionService`), earnings (ủy quyền `FinanceService`), reviews (ủy quyền `QualityService`, `WORKER_TO_CUSTOMER`).
- [x] `apps/mobile-app`: thay skeleton bằng Expo + TypeScript thật (SDK 57, React Navigation, TanStack Query, `expo-secure-store`, `expo-location`).
- [x] Màn hình: Login, Dashboard, Job Feed/Offers, Assignments list + detail (check-in/out GPS thật), Earnings, Profile/Availability, Skills.
- [x] `pnpm --filter @worklink/api typecheck` + `build` pass.
- [x] `pnpm --filter @worklink/mobile-app typecheck` pass; `expo export -p web` bundle thành công (542 modules).
- [x] Smoke test qua curl với DB thật: không token → 401; đúng worker → 200; sai workerId → 403; sai vai trò (CUSTOMER gọi worker-portal) → 403.
- [ ] UAT trên thiết bị/simulator thật (chưa có môi trường mobile trong sandbox này).

**Lưu ý vận hành:** agent nền chạy Track A khởi tạo từ một worktree bị lệch base (trước baseline 12/Track B/C), nên nhánh gốc của nó lẽ ra sẽ revert các track khác nếu merge thẳng. Đã tích hợp thủ công — chỉ lấy phần thật sự mới (`worker-portal`, `apps/mobile-app`, đăng ký module) đặt lên trên `main` hiện tại, chạy lại `pnpm install`/typecheck/build/smoke-test từ đầu thay vì tin tưởng báo cáo của agent.

## Baseline 13.2 — Blocked action (Customer Web) + Worker review/Preferred/Blocked (Mobile App)

### Customer Web

- [x] Nút "Chặn Worker" trên Job Detail, cạnh nút "Ưu tiên Worker" hiện có — cùng gọi
  `POST customer-portal/customers/:customerId/jobs/:jobId/relationships`, chỉ khác
  `preferenceType: 'BLOCKED'`.

### Backend — Worker Portal

- [x] `worker-portal`: thêm `GET/POST relationships` — worker tự đặt Preferred/Blocked
  cho khách hàng của một Job đã làm, dùng lại `QualityService.setRelationship`
  (`setByParty: 'WORKER'`).
- [x] Client chỉ cần gửi `jobId`; server tự tra `jobs.customerId` (không tin
  `customerId` từ client) rồi mới gọi `assertRelationshipActor` phía
  `QualityService` — kiểm tra chéo hai lớp (worker-portal + quality service).
- [x] `jobId` không tồn tại → 404; sai chủ sở hữu `workerId` → 403 (đã có sẵn qua
  `assertWorker`).

### Mobile App

- [x] `AssignmentDetailScreen`: khi assignment `COMPLETED`, hiện form đánh giá
  (điểm 1-5 + nhận xét) gọi `POST worker-portal/workers/:workerId/reviews`
  (endpoint đã có sẵn từ Track A, chưa từng có UI gọi tới), và 2 nút "Ưu tiên
  khách hàng này" / "Chặn khách hàng này" gọi endpoint relationships mới.

### Verify

- [x] `pnpm --filter @worklink/api typecheck` + `build` pass.
- [x] `pnpm --filter @worklink/customer-web typecheck` pass.
- [x] `pnpm --filter @worklink/mobile-app typecheck` pass; `expo export -p web`
  bundle thành công (542 modules).
- [x] Smoke test qua curl với DB thật (server đang chạy qua `dev-all.bat`): đặt
  Preferred từ phía worker → 200 đúng `customerId` được tra từ job; sai
  `workerId` → 403; `jobId` không tồn tại → 404; đã dọn dữ liệu test về
  `NEUTRAL` sau khi test xong (không để lại rác trong DB dùng chung).
- [ ] UAT thật trên trình duyệt (Customer Web) và thiết bị/simulator (Mobile
  App).

## Baseline 13.3 — Requirement Builder (Customer Web)

Backend đã hỗ trợ `requirements` trong `CreateCustomerJobDto` từ trước
(Baseline 11), nhưng `CreateJobPage.tsx` luôn gửi mảng rỗng — chưa có UI.

- [x] `CreateJobPage.tsx`: form thêm/xóa yêu cầu công việc — loại
  (Kỹ năng/Chứng chỉ/Tác phong/Kinh nghiệm), mô tả, bắt buộc hay
  không, mức tối thiểu (Cơ bản/Trung bình/Nâng cao/Chuyên sâu, khớp
  quy ước đã seed sẵn `INTERMEDIATE`/`ADVANCED`).
- [x] `JobDetailPage.tsx`: hiển thị read-only danh sách yêu cầu đã lưu
  (dữ liệu đã được fetch từ trước nhưng chưa từng render).
- [x] `types/customer.ts`: thêm `JobRequirement`/`JobRequirementInput`
  thay cho `Record<string, unknown>` không rõ nghĩa.
- [x] `pnpm --filter @worklink/customer-web typecheck` pass.
- [x] Smoke test qua curl với DB thật: tạo Job kèm 2 requirement (1
  bắt buộc + mức ADVANCED, 1 tùy chọn không mức) → lưu và trả về đúng
  từng field; đã xóa Job test khỏi DB sau khi verify xong.
- [ ] UAT trên trình duyệt thật.

## Baseline 13.4 — Xem metric cá nhân (Mobile App)

Endpoint ops cũ `GET workers/:workerId/quality-metric` đã bị khóa
`@Roles()` nội bộ ở Baseline 13.1 nên worker không gọi được nữa. Thay
vì mở thêm route mới, phát hiện `GET worker-portal/workers/:workerId/profile`
(đã có sẵn từ Track A) đã trả đủ `rating`, `completedJobs`,
`cancellationRate`, `onTimeRate`, `verificationLevel`,
`verificationStatus` — chỉ cần build màn hình mới, không cần sửa
backend.

- [x] `MetricsScreen.tsx` mới — dùng lại `getProfile()`, không thêm
  endpoint/backend.
- [x] Thêm route `Metrics` vào `RootNavigator.tsx` và nút điều hướng
  trên `DashboardScreen`.
- [x] `types/worker-portal.ts`: bổ sung `verificationLevel`,
  `verificationStatus`, `cancellationRate`, `onTimeRate` vào
  `WorkerProfile` (trước đó type thiếu dù backend đã trả về).
- [x] `pnpm --filter @worklink/mobile-app typecheck` pass; `expo
  export -p web` bundle thành công.
- [x] Verify qua curl với DB thật: response `profile` có đủ 6 field
  MetricsScreen cần, giá trị khớp (`rating: 4.8, completedJobs: 126,
  cancellationRate: 1.5, onTimeRate: 98, verificationLevel: 'V4',
  verificationStatus: 'VERIFIED'`).
- [ ] UAT trên thiết bị/simulator thật.

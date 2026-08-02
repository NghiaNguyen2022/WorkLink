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
- [ ] Authentication context.
- [ ] RBAC.
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

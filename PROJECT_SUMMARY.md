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

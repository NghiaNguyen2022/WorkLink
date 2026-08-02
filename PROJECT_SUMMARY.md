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

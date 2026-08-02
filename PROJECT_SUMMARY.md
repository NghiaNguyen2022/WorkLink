# WORKLINK PROJECT SUMMARY

## Nguồn yêu cầu

- BPRD chuẩn: `De_xuat_BPR_Nen_tang_Nhan_su_Theo_gio_v1.1.docx`.
- Phiên bản BPRD: 1.1, ngày 01/08/2026.
- Định vị: Managed Workforce Marketplace.
- Thị trường MVP: Việt Nam, pilot đề xuất tại TP.HCM.

## Nguyên tắc bảo vệ

1. Bám mã BR/BP/BRU/FR/NFR/DR/AR trong BPRD.
2. Mỗi baseline gom 2–3 chức năng trong cùng một luồng nghiệp vụ.
3. Không tạo module rời rạc không có đầu vào/đầu ra nghiệp vụ.
4. Không ghi đè hoặc xóa lịch sử giao dịch, đánh giá, đối soát.
5. Mọi thay đổi trạng thái quan trọng phải có audit/history.
6. Mọi payment/refund/adjustment phải có mã tham chiếu và idempotency.
7. Matching và risk rules phải có version.
8. Công việc rủi ro cao cần phê duyệt thủ công.
9. Dữ liệu nhạy cảm áp dụng nguyên tắc need-to-know.
10. Checklist và Project Summary cập nhật append-only sau mỗi baseline.

## Tiến độ đến Baseline 06

### Đã hoàn thành

- Core architecture: monorepo, NestJS, Drizzle, MySQL, Redis.
- User/customer/worker profiles.
- Skill, availability và service area.
- Job posting, verification và pricing.
- Candidate matching và offer.
- Assignment và giữ lịch.
- Check-in/out, evidence, incidents và customer confirmation.
- Settlement, customer charge, worker payout và earnings.

### Baseline đang triển khai

## Baseline 07 – Chất lượng sau công việc và quan hệ thuê lại

Phạm vi:

1. Review hai chiều.
2. Cập nhật hồ sơ năng lực và reliability.
3. Preferred, block và re-hire.

BPRD mapping:

- BP-11 – Đánh giá và cập nhật năng lực.
- BP-15 – Thuê lại, nhóm ưu tiên và công việc định kỳ.
- BRU-013 – Người thuê có rating/risk score.
- BRU-014 – Không xóa đánh giá.
- BRU-016 – Không dùng thuộc tính nhạy cảm để scoring.
- BRU-024 – Rule matching/risk có version và ngày hiệu lực.

## Lịch sử cập nhật

### 2026-08-02

- Chuyển chiến lược phát triển từ baseline một chức năng sang 2–3 chức năng cùng nhóm nghiệp vụ.
- Tạo checklist truy vết BPRD.
- Đánh dấu Baseline 01–05 PASS.
- Baseline 06 đã triển khai, chờ xác nhận PASS.
- Mở Baseline 07.

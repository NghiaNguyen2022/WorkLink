# WORKLINK IMPLEMENTATION CHECKLIST

> Nguồn chuẩn: `De_xuat_BPR_Nen_tang_Nhan_su_Theo_gio_v1.1.docx`
>
> Nguyên tắc cập nhật: append-only, không xóa lịch sử baseline đã hoàn thành.
>
> Chuỗi phát triển: BPRD → DB → API/service → test → checklist → project summary.

## 1. Trạng thái tổng thể

| Baseline | Nhóm nghiệp vụ | BPR/BP liên quan | Trạng thái |
|---|---|---|---|
| 01 | Khởi tạo monorepo, API, DB, Redis | NFR/kiến trúc MVP | PASS |
| 02 | Tài khoản, khách hàng, worker, kỹ năng, lịch | BP-01, BP-02, BP-03 | PASS |
| 03 | Đăng việc, xác minh, định giá, duyệt | BP-04, BP-05, BP-06 | PASS |
| 04 | Matching, offer, xác nhận, assignment | BP-07, BP-08 | PASS |
| 05 | Check-in/out, bằng chứng, sự cố, nghiệm thu | BP-09 | PASS |
| 06 | Đối soát, payment, payout, thu nhập | BP-10 | IMPLEMENTED — chờ xác nhận PASS |
| 07 | Đánh giá, điểm năng lực, preferred/block/re-hire | BP-11, BP-15 | IN PROGRESS |
| 08 | Hủy, thay thế, bồi thường, tranh chấp | BP-12, BP-13 | PLANNED |
| 09 | Đào tạo, kiểm tra, chứng nhận | BP-14 | PLANNED |
| 10 | Báo cáo, fraud controls, audit & dashboard | BP-16, BR-08 | PLANNED |
| 11 | Web portal người thuê và worker | MVP Web | PLANNED |
| 12 | Mobile app và đồng bộ trạng thái | MVP Mobile | PLANNED |
| 13 | RBAC, privacy, consent, security hardening | BRU/NFR | PLANNED |
| 14 | E2E/UAT và pilot TP.HCM | AR/MVP Acceptance | PLANNED |

## 2. Baseline 07 – Chất lượng và quan hệ thuê lại

### 07.1 Đánh giá hai chiều

- [ ] Người thuê đánh giá worker sau Job hoàn thành.
- [ ] Worker đánh giá người thuê và điều kiện công việc.
- [ ] Mỗi bên chỉ được đánh giá một lần trên một Job.
- [ ] Rating gồm tiêu chí cấu trúc và nhận xét.
- [ ] Hỗ trợ trạng thái `PENDING`, `PUBLISHED`, `FLAGGED`, `HIDDEN`.
- [ ] Không xóa review; chỉ ẩn/điều chỉnh qua quy trình.
- [ ] Review có liên kết Job, Assignment, reviewer và reviewee.
- [ ] Có thời hạn đánh giá theo policy.
- [ ] Có audit log khi thay đổi trạng thái review.

### 07.2 Cập nhật hồ sơ năng lực

- [ ] Cập nhật `rating`.
- [ ] Cập nhật `completedJobs`.
- [ ] Cập nhật `onTimeRate`.
- [ ] Cập nhật `cancellationRate`.
- [ ] Cập nhật điểm quality/reliability.
- [ ] Cập nhật số ca theo kỹ năng.
- [ ] Không cập nhật lặp lại khi API bị gọi lại.
- [ ] Lưu snapshot trước/sau mỗi lần cập nhật.
- [ ] Có version cho công thức scoring.

### 07.3 Preferred / Block / Re-hire

- [ ] Người thuê đánh dấu worker ưu tiên.
- [ ] Worker đánh dấu khách hàng ưu tiên.
- [ ] Một bên có thể yêu cầu không ghép lại.
- [ ] Block phải có lý do và mức áp dụng.
- [ ] Matching loại trừ quan hệ bị block.
- [ ] Preferred được cộng điểm có giới hạn.
- [ ] API thuê lại worker cũ từ Job đã hoàn thành.
- [ ] Re-hire tạo Job mới, không sửa Job cũ.
- [ ] Job thuê lại kế thừa danh mục, địa điểm và checklist có chọn lọc.

### 07.4 Test/UAT

- [ ] Customer review worker thành công.
- [ ] Worker review customer thành công.
- [ ] Chặn review trùng.
- [ ] Chặn reviewer không thuộc Job.
- [ ] Profile metric cập nhật đúng một lần.
- [ ] Preferred hiển thị đúng.
- [ ] Block loại worker khỏi Matching.
- [ ] Re-hire tạo Job DRAFT mới.
- [ ] Lịch sử Job cũ giữ nguyên.

## 3. Baseline 08 – Ngoại lệ và tranh chấp

- [ ] Chính sách hủy theo mốc thời gian.
- [ ] Cancellation fee và bồi thường worker.
- [ ] Yêu cầu thay người và backup assignment.
- [ ] Complaint case.
- [ ] Dispute workflow.
- [ ] Evidence và timeline.
- [ ] Refund/reversal, không xóa payment gốc.
- [ ] Phê duyệt khấu trừ có lý do và bằng chứng.

## 4. Baseline 09 – Đào tạo và chứng nhận

- [ ] Danh mục khóa học.
- [ ] Enrollment.
- [ ] Bài kiểm tra.
- [ ] Kết quả.
- [ ] Chứng nhận và ngày hết hạn.
- [ ] Matching kiểm tra chứng nhận còn hiệu lực.
- [ ] Badge năng lực.

## 5. Baseline 10 – Báo cáo và kiểm soát

- [ ] Dashboard nguồn cung.
- [ ] Fill rate.
- [ ] No-show/cancellation.
- [ ] Time-to-fill.
- [ ] Check-in delta.
- [ ] Payout SLA.
- [ ] Settlement variance.
- [ ] Review/complaint rate.
- [ ] Fraud indicators.
- [ ] Version và hiệu quả scoring.

# WorkLink Baseline 10 — Reporting, Risk & Operations Dashboard

## Phạm vi

### KPI vận hành

- Tổng số Job.
- Job hoàn tất.
- Fill rate.
- Time-to-fill trung bình.
- No-show rate.
- Cancellation rate.
- Check-in delta trung bình.
- Tỷ lệ Job được đánh giá.

### KPI tài chính và chất lượng

- Tổng tiền thu khách hàng.
- Tổng tiền trả Worker.
- Payment failure rate.
- Payout SLA.
- Settlement variance.
- Complaint/Dispute rate.
- Chứng nhận sắp hết hạn.

### Risk indicators

- Worker cancellation rate cao.
- Worker on-time rate thấp.
- Payment thất bại.
- Job thiếu nhân sự gần giờ bắt đầu.
- Certificate hết hạn trong 30 ngày.
- Support Case CRITICAL chưa xử lý.

### Operations Web

- Dashboard KPI thực.
- Bộ lọc thời gian.
- Risk Alert panel.
- Báo cáo chi tiết.
- Export CSV.

## Áp dụng

```powershell
cd D:\Source\Git\WorkLink
node scripts/apply-baseline-10.mjs

pnpm --filter @worklink/api typecheck
pnpm --filter @worklink/api build

pnpm --filter @worklink/operations-web typecheck
pnpm --filter @worklink/operations-web build
```

Không có migration mới. Baseline này chỉ đọc và tổng hợp dữ liệu nghiệp vụ hiện có.

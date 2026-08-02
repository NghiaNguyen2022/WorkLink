# WorkLink Baseline 04 — Matching & Candidate Recommendation

Luồng:

```text
Job MATCHING
→ chạy Matching
→ lưu ứng viên + điểm
→ gửi offer
→ worker ACCEPT/REJECT
→ operator CONFIRM
→ tạo assignment
→ đủ headcount thì Job ASSIGNED
```

API:

```text
POST /api/jobs/:jobId/matching/run
GET  /api/jobs/:jobId/matching/candidates
POST /api/jobs/:jobId/matching/candidates/:candidateId/offer
POST /api/jobs/:jobId/matching/offers/:offerId/respond
POST /api/jobs/:jobId/matching/offers/:offerId/confirm
POST /api/jobs/:jobId/matching/expire
```

Áp dụng:

```powershell
cd D:\Source\Git\WorkLink

pnpm --filter @worklink/api lint
pnpm check
pnpm --filter @worklink/api db:migrate
pnpm --filter @worklink/api dev
```

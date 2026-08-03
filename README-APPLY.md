# WorkLink Baseline 11.1 — Pricing Quote Field Fix

## Nguyên nhân

Schema `pricingQuotes` hiện dùng:

```text
quoteStatus
customerTotal
acceptedAt
acceptedByUserId
```

Baseline 11 đã dùng nhầm:

```text
status
customerPrice
approvedAt
```

## Thay đổi

Backend:

```text
quote.status       → quote.quoteStatus
quote.customerPrice → quote.customerTotal
approvedAt         → acceptedAt
status APPROVED    → quoteStatus ACCEPTED
```

Customer Web:

```text
status        → quoteStatus
customerPrice → customerTotal
```

## Áp dụng

```powershell
cd D:\Source\Git\WorkLink
node scripts/apply-baseline-11-1.mjs
```

Sau đó:

```powershell
pnpm --filter @worklink/api typecheck
pnpm --filter @worklink/api build

pnpm --filter @worklink/customer-web typecheck
pnpm --filter @worklink/customer-web build
```

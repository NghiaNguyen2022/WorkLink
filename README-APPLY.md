# WorkLink Baseline 10.3 — Lucide Icon Fix

## Lỗi

```text
lucide-react does not provide an export named BanknoteArrowDown
```

## Sửa

Thay:

```ts
BanknoteArrowDown
```

bằng:

```ts
Banknote
```

## Áp dụng

```powershell
cd D:\Source\Git\WorkLink
node scripts/apply-baseline-10-3.mjs
```

Sau đó chạy:

```powershell
pnpm --filter @worklink/operations-web typecheck
pnpm --filter @worklink/operations-web build
pnpm --filter @worklink/operations-web dev
```

Nếu Vite vẫn giữ cache cũ:

```powershell
Remove-Item -Recurse -Force apps\operations-web\node_modules\.vite -ErrorAction SilentlyContinue
pnpm --filter @worklink/operations-web dev
```

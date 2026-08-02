# WorkLink Baseline 07.1 — Operations Web Build Fix

## Sửa lỗi

### TS2339

```text
Property 'env' does not exist on type 'ImportMeta'
```

Bổ sung:

```text
apps/operations-web/src/vite-env.d.ts
```

### TS5096

```text
allowImportingTsExtensions can only be used when noEmit or emitDeclarationOnly is set
```

Thay `tsconfig.node.json` bằng cấu hình có `noEmit: true` và bỏ
`allowImportingTsExtensions`.

## Áp dụng

Giải nén vào thư mục gốc WorkLink, sau đó chạy:

```powershell
cd D:\Source\Git\WorkLink
pnpm --filter @worklink/operations-web typecheck
pnpm --filter @worklink/operations-web build
```

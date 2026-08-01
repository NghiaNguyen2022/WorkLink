# WorkLink Baseline 02.3 — Schema Resolution Fix

Nguyên nhân 50 lỗi TypeScript:

```text
apps/api/src/database/schema.ts          # schema cũ
apps/api/src/database/schema/index.ts    # schema mới
```

Các import dạng:

```ts
import { users } from '../../database/schema';
```

được TypeScript resolve vào file `schema.ts` cũ trước thư mục `schema/index.ts`.

Bản này thực hiện:

1. Xóa `apps/api/src/database/schema.ts`.
2. Đổi toàn bộ import sang `schema/index`.
3. Chỉ dùng `DatabaseService` cho module nghiệp vụ.
4. Bổ sung `DatabaseService.ping()` cho Health API.
5. Sửa kiểu `JWT_EXPIRES_IN` trong `AuthModule`.

## Áp dụng tự động

Giải nén gói vào một thư mục tạm, sau đó chạy:

```powershell
cd <THU_MUC_GIAI_NEN>\WorkLink-Baseline-02.3-Schema-Fix

powershell -ExecutionPolicy Bypass `
  -File .\apply.ps1 `
  -ProjectRoot D:\Source\Git\WorkLink
```

Sau đó:

```powershell
cd D:\Source\Git\WorkLink

pnpm --filter @worklink/api lint
pnpm check
pnpm --filter @worklink/api build
pnpm --filter @worklink/api dev
```

## Rà soát

```powershell
Test-Path apps\api\src\database\schema.ts
```

Kết quả phải là:

```text
False
```

Tìm import schema chưa chuẩn:

```powershell
Get-ChildItem apps\api\src -Recurse -File -Include *.ts |
Select-String "database/schema'"
```

Không được còn kết quả nào.

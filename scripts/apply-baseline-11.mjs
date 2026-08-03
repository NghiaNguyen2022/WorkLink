import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(
    path.join(root, relativePath),
    'utf8',
  );
}

function write(relativePath, content) {
  fs.writeFileSync(
    path.join(root, relativePath),
    content,
    'utf8',
  );
}

function ensureImport(source, line, anchor) {
  if (source.includes(line)) {
    return source;
  }

  if (!source.includes(anchor)) {
    throw new Error(
      `Không tìm thấy import anchor: ${anchor}`,
    );
  }

  return source.replace(anchor, `${anchor}\n${line}`);
}

function ensureModule(source, line, anchor) {
  if (source.includes(line.trim())) {
    return source;
  }

  if (!source.includes(anchor)) {
    throw new Error(
      `Không tìm thấy module anchor: ${anchor}`,
    );
  }

  return source.replace(anchor, `${anchor}\n${line}`);
}

const changes = [];

try {
  const file = 'apps/api/src/app.module.ts';
  const original = read(file);
  let updated = original;

  updated = ensureImport(
    updated,
    `import { CustomerPortalModule } from './modules/customer-portal/customer-portal.module';`,
    `import { CustomersModule } from './modules/customers/customers.module';`,
  );

  updated = ensureModule(
    updated,
    `    CustomerPortalModule,`,
    `    CustomersModule,`,
  );

  if (updated !== original) {
    changes.push({ file, updated });
  }

  const checklistFile =
    'WORKLINK_IMPLEMENTATION_CHECKLIST.md';
  const checklist = read(checklistFile);
  const section = `
# Baseline 11 — Customer Web

## Đã triển khai

- [x] Customer Portal API riêng.
- [x] Kiểm tra Job thuộc Customer.
- [x] Customer Dashboard.
- [x] Customer Job List.
- [x] Customer Job Detail.
- [x] Tạo Job Draft.
- [x] Gửi Job xác minh.
- [x] Duyệt báo giá.
- [x] Xem Worker Assignment.
- [x] Xem Check-in/Check-out.
- [x] Xác nhận hoàn tất.
- [x] Xem Payment.
- [x] Review Worker.
- [x] Preferred Worker.
- [x] Re-hire.
- [x] Complaint.
- [x] React/Vite Customer Web.
- [x] Responsive UI.

## Chưa hoàn tất/UAT

- [ ] JWT Authentication.
- [ ] Customer Profile UI.
- [ ] Location Management UI.
- [ ] Category picker thay cho nhập ID.
- [ ] Location picker thay cho nhập ID.
- [ ] Requirement builder.
- [ ] Payment gateway.
- [ ] Blocked action trên UI.
- [ ] Dispute detail/status.
- [ ] UAT toàn bộ Customer journey.
`;

  if (
    !checklist.includes(
      '# Baseline 11 — Customer Web',
    )
  ) {
    changes.push({
      file: checklistFile,
      updated: `${checklist.trimEnd()}\n\n${section.trim()}\n`,
    });
  }

  const summaryFile = 'PROJECT_SUMMARY.md';
  const summary = read(summaryFile);
  const summarySection = `
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
`;

  if (
    !summary.includes(
      '## 2026-08-02 — Baseline 11',
    )
  ) {
    changes.push({
      file: summaryFile,
      updated: `${summary.trimEnd()}\n\n${summarySection.trim()}\n`,
    });
  }

  for (const change of changes) {
    write(change.file, change.updated);
  }

  console.log(
    `Baseline 11 applied successfully: ${changes.length} files updated.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}

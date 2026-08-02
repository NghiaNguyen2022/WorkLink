import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
}

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error(`Không tìm thấy điểm patch: ${label}`);
  }
  return content.replace(search, replacement);
}

const changes = [];

function patch(relativePath, callback) {
  const original = read(relativePath);
  const updated = callback(original);
  if (updated === original) {
    throw new Error(`Không có thay đổi: ${relativePath}`);
  }
  changes.push({ relativePath, updated });
}

try {
  patch(
    'apps/api/src/database/schema/index.ts',
    (source) => {
      if (source.includes("export * from './exceptions';")) {
        return source;
      }
      return `${source.trimEnd()}\nexport * from './exceptions';\n`;
    },
  );

  patch('apps/api/src/app.module.ts', (source) => {
    let result = source;

    result = replaceOnce(
      result,
      `import { ExecutionModule } from './modules/execution/execution.module';`,
      `import { ExecutionModule } from './modules/execution/execution.module';
import { ExceptionsModule } from './modules/exceptions/exceptions.module';`,
      'ExceptionsModule import',
    );

    result = replaceOnce(
      result,
      `    ExecutionModule,`,
      `    ExecutionModule,
    ExceptionsModule,`,
      'ExceptionsModule registration',
    );

    return result;
  });

  patch(
    'apps/operations-web/src/pages/JobDetailPage.tsx',
    (source) => {
      let result = source;

      result = replaceOnce(
        result,
        `import { RehireForm } from '../features/quality/RehireForm';`,
        `import { ExceptionOverviewPanel } from '../features/exceptions/ExceptionOverviewPanel';
import { RehireForm } from '../features/quality/RehireForm';`,
        'ExceptionOverviewPanel import',
      );

      result = replaceOnce(
        result,
        `        <section className="content-card full-width">
          <div className="section-heading">
            <div>
              <h2>Thuê lại</h2>`,
        `        <section className="content-card full-width">
          <div className="section-heading">
            <div>
              <h2>Ngoại lệ và tranh chấp</h2>
              <p>
                Hủy/no-show, thay người, khiếu nại và điều chỉnh tài chính.
              </p>
            </div>
          </div>
          <ExceptionOverviewPanel
            jobId={jobId}
            assignments={assignments}
          />
        </section>

        <section className="content-card full-width">
          <div className="section-heading">
            <div>
              <h2>Thuê lại</h2>`,
        'Exception section',
      );

      return result;
    },
  );

  patch(
    'apps/operations-web/src/styles/global.css',
    (source) => `${source}

.exception-overview {
  display: grid;
  gap: 20px;
}

.exception-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.exception-summary > div {
  border: 1px solid #e2e8e2;
  border-radius: 14px;
  padding: 15px;
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 3px 8px;
}

.exception-summary svg {
  color: #a2572c;
  grid-row: span 2;
}

.exception-summary span {
  color: #74807d;
  font-size: 12px;
}

.exception-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.exception-columns section {
  border: 1px solid #e2e8e2;
  border-radius: 14px;
  padding: 14px;
}

.exception-columns pre {
  overflow: auto;
  max-height: 260px;
  background: #f5f7f4;
  padding: 10px;
  border-radius: 10px;
  font-size: 11px;
}

@media (max-width: 900px) {
  .exception-summary,
  .exception-columns {
    grid-template-columns: 1fr;
  }
}
`,
  );

  patch(
    'WORKLINK_IMPLEMENTATION_CHECKLIST.md',
    (source) => `${source}

## Baseline 08 — Exceptions, Replacement & Disputes

### Cancellation / No-show

- [x] Policy version CANCELLATION_V1.
- [x] Tính theo thời gian trước giờ bắt đầu.
- [x] Customer cancellation fee.
- [x] Worker compensation.
- [x] Platform fee.
- [x] Approval trước khi sinh payment.
- [x] Không sửa payment gốc.
- [ ] UAT các mốc 24h, 4h, 1h và dưới 1h.

### Replacement

- [x] Mở replacement request.
- [x] Chỉ từ assignment no-show/cancelled/replacement-required.
- [x] Chọn worker mới.
- [x] Chặn worker trùng Job.
- [x] Tạo assignment mới.
- [x] Liên kết replacementForAssignmentId.
- [ ] UAT assignment thay thế.

### Dispute / Adjustment

- [x] Mở complaint/dispute.
- [x] Timeline sự kiện.
- [x] Evidence.
- [x] Update trạng thái.
- [x] Propose financial adjustment.
- [x] Approve adjustment.
- [x] Sinh payment mới.
- [x] Không xóa payment cũ.
- [ ] UAT refund/adjustment end-to-end.

### Operations Web

- [x] Exception overview.
- [x] Cancellation assessment action.
- [x] Replacement request action.
- [x] Danh sách dispute và adjustment.
- [ ] Form mở dispute đầy đủ.
- [ ] Form fulfill replacement.
- [ ] Form approve adjustment.
`,
  );

  patch(
    'PROJECT_SUMMARY.md',
    (source) => `${source}

## 2026-08-02 — Baseline 08

Đã triển khai nhóm ngoại lệ:

- Cancellation/no-show policy CANCELLATION_V1.
- Customer fee và worker compensation.
- Replacement request và assignment thay thế.
- Complaint/dispute timeline.
- Financial adjustment sinh payment mới.
- Operations Web exception overview.

Baseline 08 ở trạng thái IMPLEMENTED — chờ UAT.
`,
  );

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 08 applied successfully: ${changes.length} files patched.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

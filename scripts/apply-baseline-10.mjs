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

function replaceOnce(
  content,
  search,
  replacement,
  label,
) {
  if (!content.includes(search)) {
    throw new Error(
      `Không tìm thấy điểm patch: ${label}`,
    );
  }

  return content.replace(search, replacement);
}

const changes = [];

function patch(relativePath, callback) {
  const original = read(relativePath);
  const updated = callback(original);

  if (original === updated) {
    throw new Error(
      `Không có thay đổi: ${relativePath}`,
    );
  }

  changes.push({ relativePath, updated });
}

try {
  patch('apps/api/src/app.module.ts', (source) => {
    let result = replaceOnce(
      source,
      `import { QualityModule } from './modules/quality/quality.module';`,
      `import { QualityModule } from './modules/quality/quality.module';
import { ReportingModule } from './modules/reporting/reporting.module';`,
      'ReportingModule import',
    );

    result = replaceOnce(
      result,
      `    QualityModule,`,
      `    QualityModule,
    ReportingModule,`,
      'ReportingModule registration',
    );

    return result;
  });

  patch(
    'apps/operations-web/src/app/App.tsx',
    (source) => {
      let result = replaceOnce(
        source,
        `import { NotFoundPage } from '../pages/NotFoundPage';`,
        `import { NotFoundPage } from '../pages/NotFoundPage';
import { ReportsPage } from '../pages/ReportsPage';`,
        'ReportsPage import',
      );

      result = replaceOnce(
        result,
        `        <Route path="/training" element={<TrainingPage />} />`,
        `        <Route path="/training" element={<TrainingPage />} />
        <Route path="/reports" element={<ReportsPage />} />`,
        'Reports route',
      );

      return result;
    },
  );

  patch(
    'apps/operations-web/src/layouts/AppLayout.tsx',
    (source) => {
      let result = replaceOnce(
        source,
        `  LayoutDashboard,
  Settings,`,
        `  FileChartColumnIncreasing,
  LayoutDashboard,
  Settings,`,
        'Report icon import',
      );

      result = replaceOnce(
        result,
        `  { to: '/training', label: 'Đào tạo', icon: Award },`,
        `  { to: '/training', label: 'Đào tạo', icon: Award },
  {
    to: '/reports',
    label: 'Báo cáo',
    icon: FileChartColumnIncreasing,
  },`,
        'Report navigation',
      );

      result = replaceOnce(
        result,
        `      : location.pathname.startsWith('/training')
        ? 'Đào tạo'
        : 'Tổng quan';`,
        `      : location.pathname.startsWith('/training')
        ? 'Đào tạo'
        : location.pathname.startsWith('/reports')
          ? 'Báo cáo'
          : 'Tổng quan';`,
        'Report breadcrumb',
      );

      return result;
    },
  );

  patch(
    'apps/operations-web/src/styles/global.css',
    (source) => `${source}

.report-filter,
.report-toolbar {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
}

.report-filter label,
.report-toolbar label {
  min-width: 145px;
}

.report-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 22px;
}

.report-kpi-card {
  background: #fff;
  border: 1px solid #e3e7e1;
  border-radius: 17px;
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(28, 48, 44, 0.04);
}

.report-kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #e7f1ee;
  color: #0f6a63;
}

.report-kpi-card span,
.report-kpi-card small {
  display: block;
  color: #74807d;
  font-size: 12px;
}

.report-kpi-card strong {
  display: block;
  margin: 5px 0 3px;
  font-size: 22px;
}

.report-layout,
.report-table-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.metric-progress-list {
  display: grid;
  gap: 17px;
}

.metric-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
}

.progress-track {
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: #edf0eb;
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #0f6a63;
}

.exception-metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.exception-metric-grid > div {
  padding: 15px;
  background: #f5f7f4;
  border-radius: 13px;
}

.exception-metric-grid span {
  display: block;
  color: #74807d;
  font-size: 12px;
}

.exception-metric-grid strong {
  display: block;
  margin-top: 5px;
  font-size: 21px;
}

.risk-alert-list {
  display: grid;
  gap: 10px;
}

.risk-alert {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 10px;
  border: 1px solid #e1e6e0;
  border-radius: 13px;
  padding: 14px;
}

.risk-alert > div > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.risk-alert p {
  margin: 6px 0;
  color: #4f5d59;
}

.risk-alert small,
.risk-alert span {
  color: #74807d;
  font-size: 11px;
}

.risk-critical {
  border-color: #e7aaa3;
  background: #fff5f3;
  color: #9a3027;
}

.risk-high {
  border-color: #efc29e;
  background: #fff9f0;
  color: #98571f;
}

.risk-medium {
  border-color: #e8d99f;
  background: #fffdf3;
  color: #7d681f;
}

.key-value-list {
  display: grid;
  gap: 8px;
}

.key-value-list > div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 0;
  border-bottom: 1px solid #edf0eb;
}

.key-value-list span {
  color: #63706c;
}

.trend-table {
  display: grid;
}

.trend-row {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #edf0eb;
}

.trend-row.header {
  font-weight: 800;
  background: #f5f7f4;
}

@media (max-width: 1100px) {
  .report-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .report-kpi-grid,
  .report-layout,
  .report-table-grid,
  .exception-metric-grid {
    grid-template-columns: 1fr;
  }
}
`,
  );

  patch(
    'WORKLINK_IMPLEMENTATION_CHECKLIST.md',
    (source) => `${source}

# Baseline 10 — Reporting, Risk & Dashboard

## Đã triển khai

- [x] Dashboard KPI API.
- [x] Bộ lọc from/to.
- [x] Total Jobs.
- [x] Completed Jobs.
- [x] Fill rate.
- [x] Offer acceptance rate.
- [x] Average time-to-fill.
- [x] No-show rate.
- [x] Cancellation rate.
- [x] Average check-in delta.
- [x] Review coverage rate.
- [x] Customer charges.
- [x] Worker payouts.
- [x] Pending Worker payouts.
- [x] Payment failure rate.
- [x] Payout SLA.
- [x] Settlement variance.
- [x] Average Review.
- [x] Open Support Cases.
- [x] Dispute rate.
- [x] Certificate expiry count.
- [x] Monthly Job trend.
- [x] Worker cancellation risk.
- [x] Worker on-time risk.
- [x] Payment failure alert.
- [x] Underfilled Job near start alert.
- [x] Certificate expiry alert.
- [x] Critical Case alert.
- [x] Export Jobs CSV.
- [x] Export Payments CSV.
- [x] Export Workers CSV.
- [x] Export Cases CSV.
- [x] Export Certificates CSV.
- [x] Operations Dashboard UI.
- [x] Reports UI.
- [x] Risk Alert panel.

## Chưa hoàn tất/UAT

- [ ] UAT KPI với dữ liệu thật.
- [ ] Xác nhận công thức Fill Rate.
- [ ] Xác nhận công thức Time-to-fill.
- [ ] Xác nhận Payout SLA theo BPRD.
- [ ] UAT Settlement Variance.
- [ ] UAT từng Risk Alert.
- [ ] UAT CSV tiếng Việt trên Excel.
- [ ] Phân quyền xem báo cáo.
- [ ] Scheduled report.
- [ ] Snapshot KPI theo ngày.
`,
  );

  patch(
    'PROJECT_SUMMARY.md',
    (source) => `${source}

## 2026-08-02 — Baseline 10

Đã triển khai Reporting, Risk và Operations Dashboard:

- KPI vận hành.
- KPI tài chính.
- KPI chất lượng.
- Risk indicators.
- Monthly trend.
- CSV export.
- Dashboard và Reports page trong Operations Web.

Baseline 10 ở trạng thái IMPLEMENTED — chờ UAT và xác nhận công thức KPI.
`,
  );

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 10 applied successfully: ${changes.length} files patched.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}

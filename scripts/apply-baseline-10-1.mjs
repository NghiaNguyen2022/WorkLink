import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function full(relativePath) {
  return path.join(root, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(full(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(full(relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(full(relativePath), content, 'utf8');
}

function stage(changes, relativePath, updated) {
  const original = read(relativePath);

  if (original !== updated) {
    changes.push({ relativePath, updated });
  }
}

function ensureImport(source, importLine, anchor) {
  if (source.includes(importLine)) {
    return source;
  }

  if (!source.includes(anchor)) {
    throw new Error(`Không tìm thấy import anchor: ${anchor}`);
  }

  return source.replace(anchor, `${anchor}\n${importLine}`);
}

function ensureModuleImport(
  source,
  importLine,
  anchor,
) {
  return ensureImport(source, importLine, anchor);
}

function ensureArrayItem(
  source,
  item,
  anchor,
  label,
) {
  if (source.includes(item.trim())) {
    return source;
  }

  if (!source.includes(anchor)) {
    throw new Error(`Không tìm thấy điểm chèn: ${label}`);
  }

  return source.replace(anchor, `${anchor}\n${item}`);
}

function ensureRoute(
  source,
  routeLine,
) {
  if (source.includes(routeLine.trim())) {
    return source;
  }

  const closingAnchor =
    `      </Route>\n      <Route path="*" element={<NotFoundPage />} />`;

  if (!source.includes(closingAnchor)) {
    throw new Error(
      'Không tìm thấy điểm đóng AppLayout trong App.tsx',
    );
  }

  return source.replace(
    closingAnchor,
    `        ${routeLine.trim()}\n${closingAnchor}`,
  );
}

function ensureCss(source, marker, css) {
  return source.includes(marker)
    ? source
    : `${source.trimEnd()}\n\n${css.trim()}\n`;
}

const changes = [];

try {
  // 1. API AppModule
  {
    const file = 'apps/api/src/app.module.ts';
    let source = read(file);

    source = ensureModuleImport(
      source,
      `import { ReportingModule } from './modules/reporting/reporting.module';`,
      `import { QualityModule } from './modules/quality/quality.module';`,
    );

    source = ensureArrayItem(
      source,
      `    ReportingModule,`,
      `    QualityModule,`,
      'ReportingModule registration',
    );

    stage(changes, file, source);
  }

  // 2. Operations Web routes
  {
    const file =
      'apps/operations-web/src/app/App.tsx';
    let source = read(file);

    if (
      exists(
        'apps/operations-web/src/pages/TrainingPage.tsx',
      )
    ) {
      source = ensureImport(
        source,
        `import { TrainingPage } from '../pages/TrainingPage';`,
        `import { NotFoundPage } from '../pages/NotFoundPage';`,
      );

      source = ensureRoute(
        source,
        `<Route path="/training" element={<TrainingPage />} />`,
      );
    }

    source = ensureImport(
      source,
      `import { ReportsPage } from '../pages/ReportsPage';`,
      `import { NotFoundPage } from '../pages/NotFoundPage';`,
    );

    source = ensureRoute(
      source,
      `<Route path="/reports" element={<ReportsPage />} />`,
    );

    stage(changes, file, source);
  }

  // 3. Navigation and breadcrumb
  {
    const file =
      'apps/operations-web/src/layouts/AppLayout.tsx';
    let source = read(file);

    if (
      !source.includes(
        'FileChartColumnIncreasing',
      )
    ) {
      const iconAnchor = source.includes(
        '  LayoutDashboard,',
      )
        ? '  LayoutDashboard,'
        : '  BriefcaseBusiness,';

      source = source.replace(
        iconAnchor,
        `  FileChartColumnIncreasing,\n${iconAnchor}`,
      );
    }

    if (
      exists(
        'apps/operations-web/src/pages/TrainingPage.tsx',
      ) &&
      !source.includes(`to: '/training'`)
    ) {
      if (!source.includes('Award')) {
        source = source.replace(
          '  BriefcaseBusiness,',
          '  Award,\n  BriefcaseBusiness,',
        );
      }

      source = ensureArrayItem(
        source,
        `  { to: '/training', label: 'Đào tạo', icon: Award },`,
        `  { to: '/jobs', label: 'Công việc', icon: BriefcaseBusiness },`,
        'Training navigation',
      );
    }

    source = ensureArrayItem(
      source,
      `  {
    to: '/reports',
    label: 'Báo cáo',
    icon: FileChartColumnIncreasing,
  },`,
      source.includes(`to: '/training'`)
        ? `  { to: '/training', label: 'Đào tạo', icon: Award },`
        : `  { to: '/jobs', label: 'Công việc', icon: BriefcaseBusiness },`,
      'Reports navigation',
    );

    const pageLabelPattern =
      /const pageLabel =[\s\S]*?;\n\n  return \(/;

    if (!pageLabelPattern.test(source)) {
      throw new Error(
        'Không tìm thấy pageLabel trong AppLayout.tsx',
      );
    }

    source = source.replace(
      pageLabelPattern,
      `const pageLabel =
    location.pathname.startsWith('/jobs')
      ? 'Công việc'
      : location.pathname.startsWith('/training')
        ? 'Đào tạo'
        : location.pathname.startsWith('/reports')
          ? 'Báo cáo'
          : 'Tổng quan';

  return (`,
    );

    stage(changes, file, source);
  }

  // 4. Styles
  {
    const file =
      'apps/operations-web/src/styles/global.css';
    const source = read(file);

    const css = `
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
`;

    stage(
      changes,
      file,
      ensureCss(
        source,
        '.report-kpi-grid',
        css,
      ),
    );
  }

  // 5. Checklist
  {
    const file =
      'WORKLINK_IMPLEMENTATION_CHECKLIST.md';
    const source = read(file);
    const section = `
# Baseline 10 — Reporting, Risk & Dashboard

## Đã triển khai

- [x] Dashboard KPI API.
- [x] Bộ lọc from/to.
- [x] Fill rate.
- [x] Offer acceptance rate.
- [x] Average time-to-fill.
- [x] No-show và cancellation rate.
- [x] Check-in delta.
- [x] Payout SLA.
- [x] Settlement variance.
- [x] Review và dispute metrics.
- [x] Certificate expiry.
- [x] Risk alerts.
- [x] CSV export.
- [x] Operations Dashboard.
- [x] Reports page.

## Chưa hoàn tất/UAT

- [ ] UAT KPI bằng dữ liệu thật.
- [ ] Xác nhận công thức KPI.
- [ ] UAT Risk Alert.
- [ ] UAT CSV trên Excel.
- [ ] Phân quyền báo cáo.
`;

    stage(
      changes,
      file,
      source.includes(
        '# Baseline 10 — Reporting, Risk & Dashboard',
      )
        ? source
        : `${source.trimEnd()}\n\n${section.trim()}\n`,
    );
  }

  // 6. Project summary
  {
    const file = 'PROJECT_SUMMARY.md';
    const source = read(file);
    const section = `
## 2026-08-02 — Baseline 10

Đã triển khai Reporting, Risk và Operations Dashboard:

- KPI vận hành.
- KPI tài chính.
- KPI chất lượng.
- Risk indicators.
- Monthly trend.
- CSV export.
- Dashboard và Reports page.

Baseline 10 ở trạng thái IMPLEMENTED — chờ UAT.
`;

    stage(
      changes,
      file,
      source.includes(
        '## 2026-08-02 — Baseline 10',
      )
        ? source
        : `${source.trimEnd()}\n\n${section.trim()}\n`,
    );
  }

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 10.1 applied successfully: ${changes.length} files updated.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}

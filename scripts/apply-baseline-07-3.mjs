import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function full(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(full(relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(full(relativePath), content, 'utf8');
}

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error(`Không tìm thấy điểm patch: ${label}`);
  }
  return content.replace(search, replacement);
}

const changes = [];

function stage(relativePath, updated) {
  const original = read(relativePath);
  if (original === updated) {
    throw new Error(`File không thay đổi: ${relativePath}`);
  }
  changes.push({ relativePath, updated });
}

try {
  const typesPath =
    'apps/operations-web/src/types/worklink.ts';
  const typesSource = read(typesPath);

  if (!typesSource.includes('export interface JobDetailResponse')) {
    stage(
      typesPath,
      `${typesSource}

export interface JobDetailResponse {
  job: Job;
  category?: Record<string, unknown>;
  customer?: Record<string, unknown>;
  location?: Record<string, unknown>;
  requirements?: Array<Record<string, unknown>>;
  quotes?: Array<Record<string, unknown>>;
  verificationNotes?: Array<Record<string, unknown>>;
  statusHistory?: Array<Record<string, unknown>>;
}
`,
    );
  }

  const jobsPath =
    'apps/operations-web/src/services/jobs.ts';
  let jobsSource = read(jobsPath);

  jobsSource = replaceOnce(
    jobsSource,
    `  Job,
  JobExecutionResponse,`,
    `  Job,
  JobDetailResponse,
  JobExecutionResponse,`,
    'import JobDetailResponse',
  );

  jobsSource = replaceOnce(
    jobsSource,
    `  get: (jobId: string) =>
    apiRequest<Job>(\`/jobs/\${jobId}\`),`,
    `  getDetail: (jobId: string) =>
    apiRequest<JobDetailResponse>(\`/jobs/\${jobId}\`),

  get: async (jobId: string) => {
    const response = await apiRequest<JobDetailResponse>(
      \`/jobs/\${jobId}\`,
    );

    if (!response?.job) {
      throw new Error(
        'API chi tiết Job không trả về trường job',
      );
    }

    return response.job;
  },`,
    'normalize Job detail response',
  );

  stage(jobsPath, jobsSource);

  const statusPath =
    'apps/operations-web/src/components/StatusBadge.tsx';

  stage(
    statusPath,
    `const statusLabels: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PENDING_VERIFICATION: 'Chờ xác minh',
  PENDING_INFORMATION: 'Chờ bổ sung',
  VERIFIED: 'Đã xác minh',
  PRICED: 'Đã báo giá',
  PENDING_CUSTOMER_APPROVAL: 'Chờ duyệt giá',
  MATCHING: 'Đang ghép',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  PUBLISHED: 'Đã công bố',
  FLAGGED: 'Cần xem xét',
  HIDDEN: 'Đã ẩn',
};

export function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalizedStatus =
    typeof status === 'string' && status.trim()
      ? status.trim().toUpperCase()
      : 'UNKNOWN';

  return (
    <span
      className={\`status-badge status-\${normalizedStatus.toLowerCase()}\`}
    >
      {statusLabels[normalizedStatus] ??
        (normalizedStatus === 'UNKNOWN'
          ? 'Chưa xác định'
          : normalizedStatus)}
    </span>
  );
}
`,
  );

  const checklistPath = 'WORKLINK_IMPLEMENTATION_CHECKLIST.md';
  const checklistSource = read(checklistPath);

  if (!checklistSource.includes('Baseline 07.3 — Job Detail Response Fix')) {
    stage(
      checklistPath,
      `${checklistSource}

## Baseline 07.3 — Job Detail Response Fix

- [x] Chuẩn hóa response GET /jobs/:id.
- [x] Tách response.job cho JobDetailPage.
- [x] StatusBadge chấp nhận undefined/null.
- [x] Fallback trạng thái UNKNOWN.
- [x] Bổ sung nhãn trạng thái đầy đủ.
- [ ] UAT mở Job Detail không trắng trang.
- [ ] UAT Job status hiển thị đúng.
`,
    );
  }

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 07.3 applied successfully: ${changes.length} files updated.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}

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

  if (original === updated) {
    throw new Error(`Không có thay đổi: ${relativePath}`);
  }

  changes.push({ relativePath, updated });
}

try {
  patch(
    'apps/api/src/database/schema/index.ts',
    (source) => {
      if (source.includes("export * from './training';")) {
        return source;
      }

      return `${source.trimEnd()}\nexport * from './training';\n`;
    },
  );

  patch('apps/api/src/app.module.ts', (source) => {
    let result = replaceOnce(
      source,
      `import { MatchingModule } from './modules/matching/matching.module';`,
      `import { MatchingModule } from './modules/matching/matching.module';
import { TrainingModule } from './modules/training/training.module';`,
      'TrainingModule import',
    );

    result = replaceOnce(
      result,
      `    MatchingModule,`,
      `    MatchingModule,
    TrainingModule,`,
      'TrainingModule registration',
    );

    return result;
  });

  patch(
    'apps/api/src/modules/matching/matching.service.ts',
    (source) => {
      let result = replaceOnce(
        source,
        `      workerAvailability,
      workerProfiles,`,
        `      workerAvailability,
      workerCertificates,
      workerProfiles,`,
        'workerCertificates import',
      );

      result = replaceOnce(
        result,
        `            const mandatorySkillCodes = requirements`,
        `            const certificates = workerIds.length
                  ? await this.database.db
                        .select()
                        .from(workerCertificates)
                        .where(
                              and(
                                    inArray(
                                          workerCertificates.workerId,
                                          workerIds,
                                    ),
                                    eq(
                                          workerCertificates.status,
                                          'ACTIVE',
                                    ),
                              ),
                        )
                  : [];

            const mandatoryCertificationCodes = requirements
                  .filter(
                        (item) =>
                              item.mandatory &&
                              item.requirementType ===
                                    'CERTIFICATION' &&
                              item.requirementCode,
                  )
                  .map(
                        (item) =>
                              item.requirementCode as string,
                  );

            const mandatorySkillCodes = requirements`,
        'certificate query and requirements',
      );

      result = replaceOnce(
        result,
        `                        const workerSkillsForProfile = skills.filter(`,
        `                        const hasRequiredCertificates =
                              mandatoryCertificationCodes.every(
                                    (code) =>
                                          certificates.some(
                                                (certificate) => {
                                                      if (
                                                            certificate.workerId !==
                                                                  profile.id ||
                                                            certificate.certificateCode !==
                                                                  code
                                                      ) {
                                                            return false;
                                                      }

                                                      if (
                                                            !certificate.expiresAt
                                                      ) {
                                                            return true;
                                                      }

                                                      const expiresAt =
                                                            certificate.expiresAt instanceof
                                                            Date
                                                                  ? certificate.expiresAt
                                                                  : new Date(
                                                                        certificate.expiresAt,
                                                                  );

                                                      return (
                                                            expiresAt >=
                                                            new Date()
                                                      );
                                                },
                                          ),
                              );

                        const workerSkillsForProfile = skills.filter(`,
        'certificate eligibility',
      );

      result = replaceOnce(
        result,
        `                        const available =
                              !hasConflict &&`,
        `                        const available =
                              hasRequiredCertificates &&
                              !hasConflict &&`,
        'certificate hard filter',
      );

      result = replaceOnce(
        result,
        `                              durationHours,
                        });`,
        `                              durationHours,
                        });

                        if (!hasRequiredCertificates) {
                              score.eligible = false;
                              score.warnings = [
                                    ...score.warnings,
                                    'Thiếu chứng nhận bắt buộc còn hiệu lực',
                              ];
                        }`,
        'certificate warning',
      );

      return result;
    },
  );

  patch(
    'apps/operations-web/src/app/App.tsx',
    (source) => {
      let result = replaceOnce(
        source,
        `import { NotFoundPage } from '../pages/NotFoundPage';`,
        `import { NotFoundPage } from '../pages/NotFoundPage';
import { TrainingPage } from '../pages/TrainingPage';`,
        'TrainingPage import',
      );

      result = replaceOnce(
        result,
        `        <Route path="/jobs/:jobId" element={<JobDetailPage />} />`,
        `        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/training" element={<TrainingPage />} />`,
        'Training route',
      );

      return result;
    },
  );

  patch(
    'apps/operations-web/src/layouts/AppLayout.tsx',
    (source) => {
      let result = replaceOnce(
        source,
        `  BriefcaseBusiness,
  ChevronRight,`,
        `  Award,
  BriefcaseBusiness,
  ChevronRight,`,
        'Award icon import',
      );

      result = replaceOnce(
        result,
        `  { to: '/jobs', label: 'Công việc', icon: BriefcaseBusiness },`,
        `  { to: '/jobs', label: 'Công việc', icon: BriefcaseBusiness },
  { to: '/training', label: 'Đào tạo', icon: Award },`,
        'Training navigation',
      );

      result = replaceOnce(
        result,
        `  const pageLabel =
    location.pathname.startsWith('/jobs')
      ? 'Công việc'
      : 'Tổng quan';`,
        `  const pageLabel =
    location.pathname.startsWith('/jobs')
      ? 'Công việc'
      : location.pathname.startsWith('/training')
        ? 'Đào tạo'
        : 'Tổng quan';`,
        'Training breadcrumb',
      );

      return result;
    },
  );

  patch(
    'apps/operations-web/src/styles/global.css',
    (source) => `${source}

.training-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 22px;
}

.training-summary > div {
  background: #fff;
  border: 1px solid #e3e7e1;
  border-radius: 16px;
  padding: 17px;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 3px 10px;
}

.training-summary svg {
  color: #0f6a63;
  grid-row: span 2;
}

.training-summary span {
  color: #74807d;
  font-size: 12px;
}

.course-list {
  display: grid;
  gap: 10px;
}

.course-card {
  border: 1px solid #e3e7e1;
  border-radius: 13px;
  padding: 14px;
}

.course-card > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.course-card span,
.course-card small {
  color: #74807d;
}

.course-card p {
  margin: 9px 0;
  color: #52605c;
}

@media (max-width: 760px) {
  .training-summary {
    grid-template-columns: 1fr;
  }
}
`,
  );

  patch(
    'WORKLINK_IMPLEMENTATION_CHECKLIST.md',
    (source) => `${source}

## Baseline 09 — Training, Assessment & Certification

### Course

- [x] Danh mục khóa học.
- [x] Skill code.
- [x] Certification code.
- [x] Delivery mode.
- [x] Passing score.
- [x] Certificate validity.
- [x] Operations Web course list/create.
- [ ] UAT tạo khóa học.

### Enrollment

- [x] Ghi danh Worker.
- [x] Chặn ghi danh trùng.
- [x] Progress.
- [x] Training completed.
- [ ] UAT enrollment và progress.

### Assessment

- [x] Bài kiểm tra.
- [x] Câu hỏi có trọng số.
- [x] Giới hạn số lần làm.
- [x] Chấm tự động.
- [x] Scoring version ASSESSMENT_V1.
- [x] PASS/FAIL.
- [ ] UAT nhiều lần làm bài.

### Certification

- [x] Cấp chứng nhận khi PASS.
- [x] Certificate number.
- [x] Ngày hết hạn.
- [x] Supersede chứng nhận cũ.
- [x] Thu hồi chứng nhận.
- [x] Badge năng lực.
- [x] Đồng bộ worker skill verified.
- [ ] UAT cấp và thu hồi.

### Matching

- [x] Requirement type CERTIFICATION.
- [x] ACTIVE certificate hard filter.
- [x] Kiểm tra ngày hết hạn.
- [x] Warning khi thiếu chứng nhận.
- [ ] UAT chứng nhận còn hiệu lực.
- [ ] UAT chứng nhận hết hạn.
- [ ] UAT chứng nhận bị thu hồi.
`,
  );

  patch(
    'PROJECT_SUMMARY.md',
    (source) => `${source}

## 2026-08-02 — Baseline 09

Đã triển khai nhóm đào tạo và chứng nhận:

- Course catalog.
- Worker enrollment và progress.
- Assessment và auto grading.
- Certificate lifecycle.
- Worker badge.
- Worker skill verification từ chứng nhận.
- Matching hard filter theo certificate còn hiệu lực.
- Operations Web Training page.

Baseline 09 ở trạng thái IMPLEMENTED — chờ UAT.
`,
  );

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 09 applied successfully: ${changes.length} files patched.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}

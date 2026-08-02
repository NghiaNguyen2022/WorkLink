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

function patchFile(relativePath, patcher) {
  const original = read(relativePath);
  const updated = patcher(original);

  if (updated === original) {
    throw new Error(`Không có thay đổi tại ${relativePath}`);
  }

  changes.push({ relativePath, original, updated });
}

try {
  patchFile(
    'apps/api/src/modules/matching/matching.service.ts',
    (source) => {
      let result = source;

      result = replaceOnce(
        result,
        `      matchingRuns,
      users,`,
        `      matchingRuns,
      relationshipPreferences,
      users,`,
        'matching import relationshipPreferences',
      );

      result = replaceOnce(
        result,
        `            const activeAssignments = workerIds.length`,
        `            const relationships = workerIds.length
                  ? await this.database.db
                        .select()
                        .from(relationshipPreferences)
                        .where(
                              and(
                                    eq(
                                          relationshipPreferences.customerId,
                                          job.customerId,
                                    ),
                                    inArray(
                                          relationshipPreferences.workerId,
                                          workerIds,
                                    ),
                                    eq(relationshipPreferences.active, 1),
                              ),
                        )
                  : [];

            const blockedWorkerIds = new Set(
                  relationships
                        .filter(
                              (item) =>
                                    item.preferenceType === 'BLOCKED',
                        )
                        .map((item) => item.workerId),
            );

            const preferredWorkerIds = new Set(
                  relationships
                        .filter(
                              (item) =>
                                    item.preferenceType === 'PREFERRED',
                        )
                        .map((item) => item.workerId),
            );

            const activeAssignments = workerIds.length`,
        'matching relationship query',
      );

      result = replaceOnce(
        result,
        `            const candidates = workers
                  .map(({ profile, user }) => {`,
        `            const candidates = workers
                  .filter(
                        ({ profile }) =>
                              !blockedWorkerIds.has(profile.id),
                  )
                  .map(({ profile, user }) => {`,
        'matching blocked hard filter',
      );

      result = replaceOnce(
        result,
        `                        return {
                              workerId: profile.id,
                              workerUserId: profile.userId,
                              workerName: user.fullName,
                              phone: user.phone,
                              proposedPayout: payoutPerWorker,
                              ...score,
                        };`,
        `                        const relationshipBonus =
                              preferredWorkerIds.has(profile.id)
                                    ? 5
                                    : 0;

                        const totalScore = Math.min(
                              100,
                              score.totalScore + relationshipBonus,
                        );

                        return {
                              workerId: profile.id,
                              workerUserId: profile.userId,
                              workerName: user.fullName,
                              phone: user.phone,
                              proposedPayout: payoutPerWorker,
                              ...score,
                              totalScore,
                              scoreBreakdown: {
                                    ...score.scoreBreakdown,
                                    relationshipBonus,
                              },
                              reasons: relationshipBonus
                                    ? [
                                          ...score.reasons,
                                          'Quan hệ ưu tiên với khách hàng',
                                    ]
                                    : score.reasons,
                        };`,
        'matching preferred bonus',
      );

      result = replaceOnce(
        result,
        `                              durationHours,
                        },`,
        `                              durationHours,
                              relationshipRuleVersion:
                                    'RELATIONSHIP_V1',
                              blockedWorkers:
                                    blockedWorkerIds.size,
                              preferredBonus: 5,
                        },`,
        'matching run rule metadata',
      );

      return result;
    },
  );

  patchFile(
    'apps/api/src/modules/quality/quality.module.ts',
    (source) => {
      let result = source;

      result = replaceOnce(
        result,
        `import { QualityController } from './quality.controller';
import { QualityService } from './quality.service';`,
        `import { QualityController } from './quality.controller';
import { QualityInsightsController } from './quality-insights.controller';
import { QualityInsightsService } from './quality-insights.service';
import { QualityService } from './quality.service';`,
        'quality module imports',
      );

      result = replaceOnce(
        result,
        `  controllers: [QualityController],
  providers: [QualityService],
  exports: [QualityService],`,
        `  controllers: [
    QualityController,
    QualityInsightsController,
  ],
  providers: [
    QualityService,
    QualityInsightsService,
  ],
  exports: [
    QualityService,
    QualityInsightsService,
  ],`,
        'quality module registration',
      );

      return result;
    },
  );

  patchFile(
    'apps/operations-web/src/types/worklink.ts',
    (source) => {
      return `${source}

export interface ReviewMetricUpdate {
  id: string;
  reviewId: string;
  targetType: string;
  targetId: string;
  scoringVersion: string;
  beforeSnapshot?: Record<string, unknown> | null;
  afterSnapshot?: Record<string, unknown> | null;
  processedAt: string;
}

export interface RehireLink {
  id: string;
  sourceJobId: string;
  newJobId: string;
  preferredWorkerId?: string | null;
  requestedByUserId: string;
  inheritedFields?: string[] | null;
  createdAt: string;
}

export interface JobQualityOverview {
  jobId: string;
  matchingRule: {
    version: string;
    blocked: string;
    preferredBonus: number;
    maximumScore: number;
  };
  reviews: Review[];
  metricUpdates: ReviewMetricUpdate[];
  relationships: Relationship[];
  customerMetric?: Record<string, unknown> | null;
  rehires: RehireLink[];
}
`;
    },
  );

  patchFile(
    'apps/operations-web/src/services/jobs.ts',
    (source) => {
      let result = replaceOnce(
        source,
        `  Relationship,
  Review,`,
        `  JobQualityOverview,
  Relationship,
  Review,`,
        'operations jobs type import',
      );

      result = replaceOnce(
        result,
        `  rehire: (`,
        `  moderateReview: (
    reviewId: string,
    body: {
      actorUserId: string;
      status: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN';
      reason: string;
    },
  ) =>
    apiRequest<{
      reviewId: string;
      previousStatus: string;
      status: string;
    }>(\`/reviews/\${reviewId}/moderate\`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  qualityOverview: (jobId: string) =>
    apiRequest<JobQualityOverview>(
      \`/jobs/\${jobId}/quality-overview\`,
    ),

  rehire: (`,
        'operations jobs quality methods',
      );

      return result;
    },
  );

  patchFile(
    'apps/operations-web/src/pages/JobDetailPage.tsx',
    (source) => {
      let result = replaceOnce(
        source,
        `import { RehireForm } from '../features/quality/RehireForm';`,
        `import { QualityOverviewPanel } from '../features/quality/QualityOverviewPanel';
import { RehireForm } from '../features/quality/RehireForm';`,
        'job detail quality overview import',
      );

      result = replaceOnce(
        result,
        `import { RelationshipPanel } from '../features/quality/RelationshipPanel';`,
        `import { RelationshipPanel } from '../features/quality/RelationshipPanel';
import { ReviewModerationPanel } from '../features/quality/ReviewModerationPanel';`,
        'job detail moderation import',
      );

      result = replaceOnce(
        result,
        `        <section className="content-card full-width">
          <div className="section-heading">
            <div>
              <h2>Thuê lại</h2>`,
        `        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Moderation</h2>
              <p>
                Thay đổi trạng thái Review có lý do và Audit Log.
              </p>
            </div>
          </div>
          <ReviewModerationPanel
            jobId={jobId}
            reviews={reviewsQuery.data ?? []}
          />
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Quality Overview</h2>
              <p>
                Metric snapshot, relationship rule và lịch sử thuê lại.
              </p>
            </div>
          </div>
          <QualityOverviewPanel jobId={jobId} />
        </section>

        <section className="content-card full-width">
          <div className="section-heading">
            <div>
              <h2>Thuê lại</h2>`,
        'job detail quality sections',
      );

      return result;
    },
  );

  patchFile(
    'apps/operations-web/src/styles/global.css',
    (source) => {
      return `${source}

.quality-overview {
  display: grid;
  gap: 22px;
}

.quality-rule-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.quality-rule-grid > div {
  border: 1px solid #e2e8e2;
  border-radius: 14px;
  padding: 15px;
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 3px 8px;
}

.quality-rule-grid svg {
  color: #0f6a63;
  grid-row: span 2;
}

.quality-rule-grid span {
  color: #74807d;
  font-size: 12px;
}

.quality-columns {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 18px;
}

.snapshot-list,
.relationship-list,
.rehire-list {
  display: grid;
  gap: 10px;
}

.snapshot-card,
.relationship-card,
.rehire-card {
  border: 1px solid #e2e8e2;
  border-radius: 13px;
  padding: 14px;
}

.snapshot-card > div:first-child,
.rehire-card > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.snapshot-card span,
.relationship-card span,
.rehire-card span {
  color: #74807d;
  font-size: 12px;
}

.snapshot-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.snapshot-columns pre {
  overflow: auto;
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  background: #f5f7f4;
  font-size: 11px;
}

.relationship-card p {
  margin: 7px 0 0;
  color: #56625f;
}

@media (max-width: 900px) {
  .quality-rule-grid,
  .quality-columns,
  .snapshot-columns {
    grid-template-columns: 1fr;
  }
}
`;
    },
  );

  patchFile(
    'WORKLINK_IMPLEMENTATION_CHECKLIST.md',
    (source) => {
      return `${source}

## Baseline 07.2 — Relationship Matching & Quality UI

### Matching

- [x] BLOCKED là hard filter.
- [x] BLOCKED từ một trong hai phía đều loại Worker.
- [x] PREFERRED cộng tối đa 5 điểm.
- [x] Tổng điểm sau bonus không vượt 100.
- [x] Score breakdown có relationshipBonus.
- [x] Reasons ghi nhận quan hệ ưu tiên.
- [x] Matching run lưu rule version RELATIONSHIP_V1.
- [ ] UAT Worker BLOCKED không xuất hiện.
- [ ] UAT Worker PREFERRED được cộng đúng 5 điểm.
- [ ] UAT hard filters vẫn ưu tiên hơn bonus.

### Quality Operations UI

- [x] Review moderation UI.
- [x] Publish, Flag và Hide.
- [x] Bắt buộc nhập actor và lý do phía API.
- [x] Quality overview API.
- [x] Metric before/after.
- [x] Relationship list.
- [x] Re-hire history.
- [x] Matching rule display.
- [ ] UAT moderation ghi Audit Log.
- [ ] UAT snapshot hiển thị đúng.
`;
    },
  );

  patchFile(
    'PROJECT_SUMMARY.md',
    (source) => {
      return `${source}

## 2026-08-02 — Baseline 07.2

Đã hoàn tất phần tích hợp còn lại của nhóm chất lượng:

- BLOCKED được đưa vào hard filter của Matching.
- PREFERRED được cộng tối đa 5 điểm.
- Matching rule được version hóa bằng RELATIONSHIP_V1.
- Operations Web có Review moderation.
- Operations Web hiển thị metric snapshot trước/sau.
- Operations Web hiển thị relationship và Re-hire history.

Baseline 07 chuyển sang trạng thái IMPLEMENTED — chờ UAT end-to-end.
`;
    },
  );

  for (const change of changes) {
    write(change.relativePath, change.updated);
  }

  console.log(
    `Baseline 07.2 applied successfully: ${changes.length} files patched.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

import { useQuery } from '@tanstack/react-query';
import {
  Ban,
  History,
  ShieldCheck,
  Star,
} from 'lucide-react';

import {
  ErrorState,
  LoadingState,
} from '../../components/AsyncState';
import { jobsApi } from '../../services/jobs';

export function QualityOverviewPanel({
  jobId,
}: {
  jobId: string;
}) {
  const query = useQuery({
    queryKey: ['job-quality-overview', jobId],
    queryFn: () => jobsApi.qualityOverview(jobId),
  });

  if (query.isLoading) {
    return <LoadingState label="Đang tải dữ liệu chất lượng..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={
          query.error instanceof Error
            ? query.error.message
            : 'Không tải được dữ liệu chất lượng.'
        }
      />
    );
  }

  const data = query.data!;

  return (
    <div className="quality-overview">
      <div className="quality-rule-grid">
        <div>
          <ShieldCheck />
          <span>Rule version</span>
          <strong>{data.matchingRule.version}</strong>
        </div>
        <div>
          <Ban />
          <span>Blocked</span>
          <strong>Hard filter</strong>
        </div>
        <div>
          <Star />
          <span>Preferred bonus</span>
          <strong>+{data.matchingRule.preferredBonus}</strong>
        </div>
        <div>
          <History />
          <span>Re-hire</span>
          <strong>{data.rehires.length}</strong>
        </div>
      </div>

      <div className="quality-columns">
        <div>
          <h3>Metric updates</h3>
          {data.metricUpdates.length ? (
            <div className="snapshot-list">
              {data.metricUpdates.map((item) => (
                <article key={item.id} className="snapshot-card">
                  <div>
                    <strong>{item.targetType}</strong>
                    <span>{item.scoringVersion}</span>
                  </div>
                  <div className="snapshot-columns">
                    <pre>
                      {JSON.stringify(
                        item.beforeSnapshot,
                        null,
                        2,
                      )}
                    </pre>
                    <pre>
                      {JSON.stringify(
                        item.afterSnapshot,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-text">
              Chưa có metric update.
            </p>
          )}
        </div>

        <div>
          <h3>Quan hệ hiện tại</h3>
          {data.relationships.length ? (
            <div className="relationship-list">
              {data.relationships.map((item) => (
                <article
                  className="relationship-card"
                  key={item.id}
                >
                  <strong>{item.preferenceType}</strong>
                  <span>{item.setByParty}</span>
                  <p>{item.reason || 'Không có lý do.'}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-text">
              Chưa thiết lập quan hệ.
            </p>
          )}
        </div>
      </div>

      <div>
        <h3>Lịch sử Re-hire</h3>
        {data.rehires.length ? (
          <div className="rehire-list">
            {data.rehires.map((item) => (
              <article className="rehire-card" key={item.id}>
                <div>
                  <strong>Job mới: {item.newJobId}</strong>
                  <span>
                    {new Date(item.createdAt).toLocaleString(
                      'vi-VN',
                    )}
                  </span>
                </div>
                <span>
                  Worker ưu tiên:{' '}
                  {item.preferredWorkerId ?? 'Không chỉ định'}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted-text">
            Chưa có Job thuê lại.
          </p>
        )}
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import {
  Banknote,
  BriefcaseBusiness,
  CircleCheckBig,
  Clock3,
  ShieldAlert,
  Star,
  UserRoundCheck,
  WalletCards,
} from 'lucide-react';
import { useState } from 'react';

import {
  ErrorState,
  LoadingState,
} from '../components/AsyncState';
import { KpiCard } from '../features/reporting/KpiCard';
import { RiskAlertPanel } from '../features/reporting/RiskAlertPanel';
import { reportingApi } from '../services/reporting';

function defaultFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);

  const query = useQuery({
    queryKey: ['reporting-dashboard', from, to],
    queryFn: () =>
      reportingApi.dashboard({ from, to }),
  });

  return (
    <>
      <div className="page-heading split">
        <div>
          <span className="eyebrow">
            OPERATIONS INTELLIGENCE
          </span>
          <h1>Dashboard vận hành</h1>
          <p>
            Theo dõi cung ứng nhân sự, thực hiện công việc,
            thanh toán, chất lượng và rủi ro.
          </p>
        </div>

        <div className="report-filter">
          <label>
            Từ ngày
            <input
              type="date"
              value={from}
              onChange={(event) =>
                setFrom(event.target.value)
              }
            />
          </label>
          <label>
            Đến ngày
            <input
              type="date"
              value={to}
              onChange={(event) =>
                setTo(event.target.value)
              }
            />
          </label>
        </div>
      </div>

      {query.isLoading && (
        <LoadingState label="Đang tổng hợp KPI..." />
      )}

      {query.isError && (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : 'Không tải được Dashboard.'
          }
        />
      )}

      {query.data && (
        <>
          <div className="report-kpi-grid">
            <KpiCard
              icon={BriefcaseBusiness}
              label="Tổng Job"
              value={String(
                query.data.operations.totalJobs,
              )}
            />
            <KpiCard
              icon={CircleCheckBig}
              label="Job hoàn tất"
              value={String(
                query.data.operations.completedJobs,
              )}
            />
            <KpiCard
              icon={UserRoundCheck}
              label="Fill rate"
              value={`${query.data.operations.fillRate}%`}
            />
            <KpiCard
              icon={Clock3}
              label="Time-to-fill"
              value={`${query.data.operations.averageTimeToFillMinutes} phút`}
            />
            <KpiCard
              icon={WalletCards}
              label="Payout SLA"
              value={`${query.data.finance.payoutSlaRate}%`}
            />
            <KpiCard
              icon={Banknote}
              label="Worker payout"
              value={`${query.data.finance.workerPayouts.toLocaleString(
                'vi-VN',
              )} ₫`}
            />
            <KpiCard
              icon={Star}
              label="Điểm Review"
              value={`${query.data.quality.averageReview}/5`}
              note={`${query.data.quality.totalReviews} lượt`}
            />
            <KpiCard
              icon={ShieldAlert}
              label="Risk alerts"
              value={String(
                query.data.riskAlerts.length,
              )}
            />
          </div>

          <div className="report-layout">
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Hiệu quả vận hành</h2>
                  <p>
                    Các tỷ lệ chính trong khoảng thời gian đã chọn.
                  </p>
                </div>
              </div>

              <div className="metric-progress-list">
                {[
                  {
                    label: 'Offer acceptance',
                    value:
                      query.data.operations
                        .offerAcceptanceRate,
                  },
                  {
                    label: 'Review coverage',
                    value:
                      query.data.operations
                        .reviewCoverageRate,
                  },
                  {
                    label: 'Payout SLA',
                    value:
                      query.data.finance.payoutSlaRate,
                  },
                  {
                    label: 'Payment success',
                    value:
                      100 -
                      query.data.finance
                        .paymentFailureRate,
                  },
                ].map((item) => (
                  <div
                    className="metric-progress"
                    key={item.label}
                  >
                    <div>
                      <span>{item.label}</span>
                      <strong>{item.value}%</strong>
                    </div>
                    <div className="progress-track">
                      <span
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, item.value),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Ngoại lệ</h2>
                  <p>
                    Chỉ số cần theo dõi sát trong vận hành.
                  </p>
                </div>
              </div>

              <div className="exception-metric-grid">
                <div>
                  <span>No-show</span>
                  <strong>
                    {query.data.operations.noShowRate}%
                  </strong>
                </div>
                <div>
                  <span>Cancellation</span>
                  <strong>
                    {
                      query.data.operations
                        .cancellationRate
                    }
                    %
                  </strong>
                </div>
                <div>
                  <span>Dispute</span>
                  <strong>
                    {query.data.quality.disputeRate}%
                  </strong>
                </div>
                <div>
                  <span>Certificate sắp hết hạn</span>
                  <strong>
                    {
                      query.data.quality
                        .expiringCertificates
                    }
                  </strong>
                </div>
              </div>
            </section>

            <section className="content-card full-width">
              <div className="section-heading">
                <div>
                  <h2>Cảnh báo rủi ro</h2>
                  <p>
                    Ưu tiên CRITICAL, HIGH, MEDIUM rồi LOW.
                  </p>
                </div>
              </div>
              <RiskAlertPanel
                alerts={query.data.riskAlerts}
              />
            </section>
          </div>
        </>
      )}
    </>
  );
}

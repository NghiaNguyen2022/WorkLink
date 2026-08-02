import { useQuery } from '@tanstack/react-query';
import {
  Download,
  FileChartColumnIncreasing,
} from 'lucide-react';
import { useState } from 'react';

import {
  ErrorState,
  LoadingState,
} from '../components/AsyncState';
import { reportingApi } from '../services/reporting';

function defaultFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().slice(0, 10);
}

export function ReportsPage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [report, setReport] = useState('JOBS');

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
            REPORTING & EXPORT
          </span>
          <h1>Báo cáo vận hành</h1>
          <p>
            Tổng hợp số liệu quản trị và xuất dữ liệu phục vụ
            đối soát hoặc phân tích tiếp.
          </p>
        </div>
      </div>

      <section className="content-card">
        <div className="report-toolbar">
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
          <label>
            Dữ liệu export
            <select
              value={report}
              onChange={(event) =>
                setReport(event.target.value)
              }
            >
              <option value="JOBS">Jobs</option>
              <option value="PAYMENTS">Payments</option>
              <option value="WORKERS">Workers</option>
              <option value="CASES">Support Cases</option>
              <option value="CERTIFICATES">
                Certificates
              </option>
            </select>
          </label>
          <a
            className="primary-button"
            href={reportingApi.exportUrl(report, {
              from,
              to,
            })}
          >
            <Download size={17} />
            Xuất CSV
          </a>
        </div>
      </section>

      {query.isLoading && <LoadingState />}
      {query.isError && (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : 'Không tải được báo cáo.'
          }
        />
      )}

      {query.data && (
        <div className="report-table-grid">
          <section className="content-card">
            <h2>Operations</h2>
            <div className="key-value-list">
              {Object.entries(
                query.data.operations,
              ).map(([key, value]) => (
                <div key={key}>
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="content-card">
            <h2>Finance</h2>
            <div className="key-value-list">
              {Object.entries(query.data.finance).map(
                ([key, value]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="content-card">
            <h2>Quality</h2>
            <div className="key-value-list">
              {Object.entries(query.data.quality).map(
                ([key, value]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="content-card">
            <h2>
              <FileChartColumnIncreasing size={20} />
              Xu hướng theo tháng
            </h2>
            <div className="trend-table">
              <div className="trend-row header">
                <span>Tháng</span>
                <span>Tổng</span>
                <span>Hoàn tất</span>
                <span>Hủy</span>
              </div>
              {query.data.trends.map((item) => (
                <div
                  className="trend-row"
                  key={item.month}
                >
                  <span>{item.month}</span>
                  <span>{item.total}</span>
                  <span>{item.completed}</span>
                  <span>{item.cancelled}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

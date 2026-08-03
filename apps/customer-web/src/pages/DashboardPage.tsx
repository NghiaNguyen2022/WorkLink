import { useQuery } from '@tanstack/react-query';
import {
  Banknote,
  BriefcaseBusiness,
  CircleCheckBig,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { customerPortalApi } from '../services/customerPortal';
import { useCustomerSession } from '../session/CustomerSession';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardPage() {
  const session = useCustomerSession();
  const query = useQuery({
    queryKey: [
      'customer-dashboard',
      session.customerId,
    ],
    queryFn: () =>
      customerPortalApi.dashboard(
        session.customerId,
        session.customerUserId,
      ),
  });

  if (query.isLoading) {
    return <div className="state-card">Đang tải...</div>;
  }

  if (query.isError) {
    return (
      <div className="state-card error">
        {query.error.message}
      </div>
    );
  }

  const data = query.data!;

  return (
    <>
      <div className="page-heading">
        <span>MY WORKLINK</span>
        <h1>Tổng quan công việc</h1>
        <p>
          Theo dõi nhu cầu nhân sự, tiến độ thực hiện và thanh
          toán.
        </p>
      </div>

      <div className="customer-kpi-grid">
        {[
          {
            label: 'Tổng công việc',
            value: data.totalJobs,
            icon: BriefcaseBusiness,
          },
          {
            label: 'Đang hoạt động',
            value: data.activeJobs,
            icon: CircleCheckBig,
          },
          {
            label: 'Chờ đánh giá',
            value: data.reviewPendingJobs,
            icon: Star,
          },
          {
            label: 'Đã thanh toán',
            value: `${data.totalPaid.toLocaleString('vi-VN')} ₫`,
            icon: Banknote,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label}>
              <Icon />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          );
        })}
      </div>

      <section className="customer-card">
        <div className="section-heading">
          <div>
            <h2>Công việc gần đây</h2>
            <p>Các yêu cầu mới nhất của anh/chị.</p>
          </div>
          <Link to="/jobs">Xem tất cả</Link>
        </div>
        <div className="customer-job-list">
          {data.recentJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="customer-job-row"
            >
              <div>
                <strong>{job.title}</strong>
                <span>{job.jobCode}</span>
              </div>
              <StatusBadge status={job.status} />
              <span>
                {new Date(job.startAt).toLocaleString(
                  'vi-VN',
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

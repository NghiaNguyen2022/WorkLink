import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { StatusBadge } from '../components/StatusBadge';
import { customerPortalApi } from '../services/customerPortal';
import { useCustomerSession } from '../session/CustomerSession';

export function JobsPage() {
  const session = useCustomerSession();
  const query = useQuery({
    queryKey: ['customer-jobs', session.customerId],
    queryFn: () =>
      customerPortalApi.jobs(
        session.customerId,
        session.customerUserId,
      ),
  });

  return (
    <>
      <div className="page-heading split">
        <div>
          <span>MY JOBS</span>
          <h1>Công việc của tôi</h1>
          <p>
            Theo dõi từ bản nháp đến hoàn tất và thuê lại.
          </p>
        </div>
        <Link className="primary-button" to="/jobs/new">
          Đăng việc mới
        </Link>
      </div>

      {query.isLoading && (
        <div className="state-card">Đang tải...</div>
      )}
      {query.isError && (
        <div className="state-card error">
          {query.error.message}
        </div>
      )}

      <div className="customer-job-grid">
        {query.data?.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="customer-job-card"
          >
            <div>
              <span>{job.jobCode}</span>
              <StatusBadge status={job.status} />
            </div>
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <footer>
              <span>{job.headcount} nhân sự</span>
              <span>
                {new Date(job.startAt).toLocaleString(
                  'vi-VN',
                )}
              </span>
            </footer>
          </Link>
        ))}
      </div>
    </>
  );
}

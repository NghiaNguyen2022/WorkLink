import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/AsyncState';
import { StatusBadge } from '../components/StatusBadge';
import { jobsApi } from '../services/jobs';

export function JobsPage() {
  const query = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">JOB MANAGEMENT</span>
          <h1>Công việc</h1>
          <p>
            Quản lý toàn bộ vòng đời từ đăng việc đến đánh giá và thuê
            lại.
          </p>
        </div>
      </div>

      {query.isLoading && <LoadingState />}

      {query.isError && (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : 'Không tải được danh sách công việc.'
          }
        />
      )}

      {query.data?.length === 0 && (
        <EmptyState message="Chưa có công việc." />
      )}

      <div className="job-grid">
        {query.data?.map((job) => (
          <Link
            className="job-card"
            key={job.id}
            to={`/jobs/${job.id}`}
          >
            <div className="job-card-top">
              <span>{job.jobCode}</span>
              <StatusBadge status={job.status} />
            </div>
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <div className="job-meta">
              <span>
                <CalendarDays size={16} />
                {new Date(job.startAt).toLocaleString('vi-VN')}
              </span>
              <span>
                <Users size={16} />
                {job.headcount} nhân sự
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

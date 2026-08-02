import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Users,
} from 'lucide-react';
import { useParams } from 'react-router-dom';

import {
  ErrorState,
  LoadingState,
} from '../components/AsyncState';
import { StatusBadge } from '../components/StatusBadge';
import { QualityOverviewPanel } from '../features/quality/QualityOverviewPanel';
import { ExceptionOverviewPanel } from '../features/exceptions/ExceptionOverviewPanel';
import { RehireForm } from '../features/quality/RehireForm';
import { RelationshipPanel } from '../features/quality/RelationshipPanel';
import { ReviewModerationPanel } from '../features/quality/ReviewModerationPanel';
import { ReviewForm } from '../features/quality/ReviewForm';
import { jobsApi } from '../services/jobs';

export function JobDetailPage() {
  const { jobId = '' } = useParams();

  const jobQuery = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId),
    enabled: Boolean(jobId),
  });

  const executionQuery = useQuery({
    queryKey: ['job-execution', jobId],
    queryFn: () => jobsApi.execution(jobId),
    enabled: Boolean(jobId),
  });

  const reviewsQuery = useQuery({
    queryKey: ['job-reviews', jobId],
    queryFn: () => jobsApi.reviews(jobId),
    enabled: Boolean(jobId),
  });

  if (
    jobQuery.isLoading ||
    executionQuery.isLoading ||
    reviewsQuery.isLoading
  ) {
    return <LoadingState label="Đang tải chi tiết công việc..." />;
  }

  if (jobQuery.isError || executionQuery.isError) {
    const error = jobQuery.error ?? executionQuery.error;
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : 'Không tải được chi tiết Job.'
        }
      />
    );
  }

  const job = jobQuery.data!;
  const assignments = executionQuery.data?.assignments ?? [];
  const workers = assignments.map((item) => ({
    workerId: item.assignment.workerId,
    workerUser: item.workerUser,
  }));

  return (
    <>
      <div className="page-heading split">
        <div>
          <span className="eyebrow">{job.jobCode}</span>
          <h1>{job.title}</h1>
          <p>{job.description}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="detail-summary">
        <div>
          <CalendarDays />
          <span>Thời gian</span>
          <strong>
            {new Date(job.startAt).toLocaleString('vi-VN')}
          </strong>
        </div>
        <div>
          <Users />
          <span>Nhân sự</span>
          <strong>{job.headcount}</strong>
        </div>
        <div>
          <CircleDollarSign />
          <span>Giá trị</span>
          <strong>
            {job.agreedPrice
              ? job.agreedPrice.toLocaleString('vi-VN') + ' ₫'
              : 'Chưa chốt'}
          </strong>
        </div>
        <div>
          <MapPin />
          <span>Location ID</span>
          <strong>{job.locationId}</strong>
        </div>
      </div>

      <div className="detail-grid">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Đánh giá hai chiều</h2>
              <p>
                Review được ghi lịch sử và cập nhật metric đúng một lần.
              </p>
            </div>
          </div>
          <ReviewForm
            jobId={jobId}
            assignments={assignments}
          />
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Quan hệ nhân sự</h2>
              <p>
                Đặt ưu tiên, trung lập hoặc không ghép lại.
              </p>
            </div>
          </div>
          <RelationshipPanel
            jobId={jobId}
            customerId={job.customerId}
            workers={workers}
          />
        </section>

        <section className="content-card full-width">
          <div className="section-heading">
            <div>
              <h2>Lịch sử đánh giá</h2>
              <p>
                Review không bị xóa, chỉ có thể moderate.
              </p>
            </div>
          </div>

          <div className="review-list">
            {reviewsQuery.data?.length ? (
              reviewsQuery.data.map((review) => (
                <article className="review-card" key={review.id}>
                  <div>
                    <strong>
                      {review.reviewerType ===
                      'CUSTOMER_TO_WORKER'
                        ? 'Khách hàng → Worker'
                        : 'Worker → Khách hàng'}
                    </strong>
                    <span>
                      {new Date(review.createdAt).toLocaleString(
                        'vi-VN',
                      )}
                    </span>
                  </div>
                  <div className="rating-score">
                    {review.overallRating}/5
                  </div>
                  <p>{review.comment || 'Không có nhận xét.'}</p>
                  <StatusBadge status={review.status} />
                </article>
              ))
            ) : (
              <p className="muted-text">
                Chưa có đánh giá cho công việc này.
              </p>
            )}
          </div>
        </section>

        <section className="content-card">
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
              <h2>Ngoại lệ và tranh chấp</h2>
              <p>
                Hủy/no-show, thay người, khiếu nại và điều chỉnh tài chính.
              </p>
            </div>
          </div>
          <ExceptionOverviewPanel
            jobId={jobId}
            assignments={assignments}
          />
        </section>

        <section className="content-card full-width">
          <div className="section-heading">
            <div>
              <h2>Thuê lại</h2>
              <p>
                Tạo Job DRAFT mới từ dữ liệu Job đã hoàn tất.
              </p>
            </div>
          </div>
          <RehireForm jobId={jobId} workers={workers} />
        </section>
      </div>
    </>
  );
}

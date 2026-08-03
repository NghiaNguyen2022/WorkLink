import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { StatusBadge } from '../components/StatusBadge';
import { customerPortalApi } from '../services/customerPortal';
import { useCustomerSession } from '../session/CustomerSession';

export function JobDetailPage() {
  const { jobId = '' } = useParams();
  const session = useCustomerSession();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [rehireStart, setRehireStart] = useState('');
  const [rehireEnd, setRehireEnd] = useState('');

  const query = useQuery({
    queryKey: ['customer-job', jobId],
    queryFn: () =>
      customerPortalApi.detail(
        session.customerId,
        session.customerUserId,
        jobId,
      ),
  });

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['customer-job', jobId],
    });

  const action = useMutation({
    mutationFn: ({
      path,
      body,
    }: {
      path: string;
      body: Record<string, unknown>;
    }) =>
      customerPortalApi.action(
        session.customerId,
        jobId,
        path,
        body,
      ),
    onSuccess: refresh,
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
  const job = data.job;

  return (
    <>
      <div className="page-heading split">
        <div>
          <span>{job.jobCode}</span>
          <h1>{job.title}</h1>
          <p>{job.description}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="customer-detail-grid">
        <section className="customer-card">
          <h2>Tổng quan</h2>
          <div className="key-value-list">
            <div>
              <span>Thời gian</span>
              <strong>
                {new Date(job.startAt).toLocaleString(
                  'vi-VN',
                )}
              </strong>
            </div>
            <div>
              <span>Nhân sự</span>
              <strong>{job.headcount}</strong>
            </div>
            <div>
              <span>Giá chốt</span>
              <strong>
                {job.agreedPrice
                  ? `${job.agreedPrice.toLocaleString(
                      'vi-VN',
                    )} ₫`
                  : 'Chưa có'}
              </strong>
            </div>
          </div>

          {job.status === 'DRAFT' && (
            <button
              className="primary-button"
              type="button"
              onClick={() =>
                action.mutate({
                  path: 'submit',
                  body: {
                    customerUserId:
                      session.customerUserId,
                  },
                })
              }
            >
              Gửi xác minh
            </button>
          )}
        </section>

        <section className="customer-card">
          <h2>Báo giá</h2>
          <div className="stack-list">
            {data.quotes.map((quote) => (
              <article key={quote.id}>
                <div>
                  <strong>
                    {quote.customerTotal.toLocaleString(
                      'vi-VN',
                    )}{' '}
                    ₫
                  </strong>
                  <StatusBadge status={quote.quoteStatus} />
                </div>
                <small>
                  Phí nền tảng:{' '}
                  {quote.platformFeeAmount.toLocaleString(
                    'vi-VN',
                  )}{' '}
                  ₫
                </small>
                {quote.quoteStatus !== 'ACCEPTED' && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      action.mutate({
                        path: 'approve-quote',
                        body: {
                          customerUserId:
                            session.customerUserId,
                          quoteId: quote.id,
                        },
                      })
                    }
                  >
                    Duyệt báo giá
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="customer-card full-width">
          <h2>Nhân sự và thực hiện</h2>
          <div className="worker-grid">
            {data.assignments.map((item) => (
              <article
                key={item.assignment.id}
                className="worker-card"
              >
                <div>
                  <strong>
                    {item.workerUser.fullName}
                  </strong>
                  <StatusBadge
                    status={item.assignment.status}
                  />
                </div>
                <p>
                  ⭐ {item.worker.rating}/5 •{' '}
                  {item.worker.completedJobs} công việc
                </p>
                <p>
                  Check-in:{' '}
                  {item.session?.checkInAt
                    ? new Date(
                        item.session.checkInAt,
                      ).toLocaleString('vi-VN')
                    : 'Chưa có'}
                </p>
                <p>
                  Check-out:{' '}
                  {item.session?.checkOutAt
                    ? new Date(
                        item.session.checkOutAt,
                      ).toLocaleString('vi-VN')
                    : 'Chưa có'}
                </p>

                {item.assignment.status ===
                  'WAITING_CONFIRMATION' && (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() =>
                      action.mutate({
                        path: `assignments/${item.assignment.id}/confirm`,
                        body: {
                          customerUserId:
                            session.customerUserId,
                          note: 'Xác nhận từ Customer Portal',
                        },
                      })
                    }
                  >
                    Xác nhận hoàn tất
                  </button>
                )}

                {item.assignment.status ===
                  'COMPLETED' && (
                  <>
                    <div className="form-row">
                      <label>
                        Điểm
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={rating}
                          onChange={(event) =>
                            setRating(
                              Number(
                                event.target.value,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Nhận xét
                        <input
                          value={comment}
                          onChange={(event) =>
                            setComment(
                              event.target.value,
                            )
                          }
                        />
                      </label>
                    </div>
                    <div className="button-group">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() =>
                          action.mutate({
                            path: 'reviews',
                            body: {
                              customerUserId:
                                session.customerUserId,
                              assignmentId:
                                item.assignment.id,
                              overallRating: rating,
                              criteria: {
                                punctuality: rating,
                                quality: rating,
                              },
                              comment,
                              wouldHireAgain: true,
                            },
                          })
                        }
                      >
                        Gửi đánh giá
                      </button>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() =>
                          action.mutate({
                            path: 'relationships',
                            body: {
                              customerUserId:
                                session.customerUserId,
                              workerId:
                                item.assignment.workerId,
                              preferenceType:
                                'PREFERRED',
                              reason:
                                'Ưu tiên từ Customer Portal',
                            },
                          })
                        }
                      >
                        Ưu tiên Worker
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="customer-card">
          <h2>Thanh toán</h2>
          <div className="stack-list">
            {data.payments.map((payment) => (
              <article key={payment.id}>
                <div>
                  <strong>
                    {payment.amount.toLocaleString(
                      'vi-VN',
                    )}{' '}
                    {payment.currency}
                  </strong>
                  <StatusBadge
                    status={payment.status}
                  />
                </div>
                <small>{payment.paymentType}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="customer-card">
          <h2>Thuê lại</h2>
          <div className="form-stack">
            <label>
              Bắt đầu
              <input
                type="datetime-local"
                value={rehireStart}
                onChange={(event) =>
                  setRehireStart(event.target.value)
                }
              />
            </label>
            <label>
              Kết thúc
              <input
                type="datetime-local"
                value={rehireEnd}
                onChange={(event) =>
                  setRehireEnd(event.target.value)
                }
              />
            </label>
            <button
              className="primary-button"
              type="button"
              disabled={!rehireStart || !rehireEnd}
              onClick={() =>
                action.mutate({
                  path: 're-hire',
                  body: {
                    customerUserId:
                      session.customerUserId,
                    startAt: new Date(
                      rehireStart,
                    ).toISOString(),
                    endAt: new Date(
                      rehireEnd,
                    ).toISOString(),
                  },
                })
              }
            >
              Tạo Job thuê lại
            </button>
          </div>
        </section>

        <section className="customer-card full-width">
          <h2>Khiếu nại / Tranh chấp</h2>
          <div className="form-stack">
            <label>
              Nội dung
              <textarea
                rows={4}
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
              />
            </label>
            <button
              className="secondary-button danger"
              type="button"
              disabled={!reason}
              onClick={() =>
                action.mutate({
                  path: 'complaints',
                  body: {
                    customerUserId:
                      session.customerUserId,
                    caseType: 'COMPLAINT',
                    priority: 'NORMAL',
                    subject: `Khiếu nại ${job.jobCode}`,
                    description: reason,
                  },
                })
              }
            >
              Gửi khiếu nại
            </button>
          </div>
        </section>
      </div>

      {action.isError && (
        <div className="floating-message error">
          {action.error.message}
        </div>
      )}
      {action.isSuccess && (
        <div className="floating-message success">
          Thao tác đã được ghi nhận.
        </div>
      )}
    </>
  );
}

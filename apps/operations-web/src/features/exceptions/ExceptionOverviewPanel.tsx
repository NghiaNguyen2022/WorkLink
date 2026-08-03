import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CircleDollarSign,
  Gavel,
  RefreshCcw,
  Scale,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import {
  ErrorState,
  LoadingState,
} from '../../components/AsyncState';
import { exceptionsApi } from '../../services/exceptions';

export function ExceptionOverviewPanel({
  jobId,
  assignments,
}: {
  jobId: string;
  assignments: Array<{
    assignment: {
      id: string;
      status: string;
    };
    workerUser: {
      fullName: string;
    };
  }>;
}) {
  const queryClient = useQueryClient();
  const [assignmentId, setAssignmentId] = useState(
    assignments[0]?.assignment.id ?? '',
  );
  const [actorUserId, setActorUserId] = useState('');
  const [reason, setReason] = useState('');

  const [fulfillRequestId, setFulfillRequestId] = useState('');
  const [fulfillWorkerId, setFulfillWorkerId] = useState('');
  const [fulfillPayout, setFulfillPayout] = useState('');
  const [fulfillRetention, setFulfillRetention] = useState('');

  const [disputeCaseType, setDisputeCaseType] = useState<
    'COMPLAINT' | 'DISPUTE'
  >('COMPLAINT');
  const [disputePriority, setDisputePriority] = useState<
    'NORMAL' | 'HIGH' | 'CRITICAL'
  >('NORMAL');
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDescription, setDisputeDescription] =
    useState('');

  const [approveAdjustmentId, setApproveAdjustmentId] =
    useState('');

  const query = useQuery({
    queryKey: ['job-exceptions', jobId],
    queryFn: () => exceptionsApi.overview(jobId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['job-exceptions', jobId],
    });

  const assessMutation = useMutation({
    mutationFn: () =>
      exceptionsApi.assessCancellation(assignmentId, {
        actorUserId,
        eventType: 'CANCELLATION',
        cancelledByParty: 'CUSTOMER',
        reason,
      }),
    onSuccess: invalidate,
  });

  const replaceMutation = useMutation({
    mutationFn: () =>
      exceptionsApi.requestReplacement(assignmentId, {
        actorUserId,
        reason,
        priority: 'HIGH',
      }),
    onSuccess: invalidate,
  });

  const fulfillMutation = useMutation({
    mutationFn: () =>
      exceptionsApi.fulfillReplacement(fulfillRequestId, {
        actorUserId,
        workerId: fulfillWorkerId,
        agreedPayout: Number(fulfillPayout),
        retentionAmount: fulfillRetention
          ? Number(fulfillRetention)
          : undefined,
      }),
    onSuccess: () => {
      invalidate();
      setFulfillRequestId('');
      setFulfillWorkerId('');
      setFulfillPayout('');
      setFulfillRetention('');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () =>
      exceptionsApi.openDispute(jobId, {
        actorUserId,
        caseType: disputeCaseType,
        priority: disputePriority,
        subject: disputeSubject,
        description: disputeDescription,
      }),
    onSuccess: () => {
      invalidate();
      setDisputeSubject('');
      setDisputeDescription('');
    },
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      exceptionsApi.approveAdjustment(approveAdjustmentId, {
        actorUserId,
      }),
    onSuccess: () => {
      invalidate();
      setApproveAdjustmentId('');
    },
  });

  if (query.isLoading) {
    return <LoadingState label="Đang tải ngoại lệ..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={
          query.error instanceof Error
            ? query.error.message
            : 'Không tải được dữ liệu ngoại lệ.'
        }
      />
    );
  }

  const data = query.data!;
  const openReplacements = data.replacements.filter(
    (item) => item.status === 'OPEN',
  );
  const proposedAdjustments = data.adjustments.filter(
    (item) => item.status === 'PROPOSED',
  );

  return (
    <div className="exception-overview">
      <div className="exception-summary">
        <div>
          <AlertTriangle />
          <span>Assessments</span>
          <strong>{data.assessments.length}</strong>
        </div>
        <div>
          <RefreshCcw />
          <span>Replacement</span>
          <strong>{data.replacements.length}</strong>
        </div>
        <div>
          <Scale />
          <span>Disputes</span>
          <strong>{data.cases.length}</strong>
        </div>
      </div>

      <div className="form-stack">
        <label>
          Assignment
          <select
            value={assignmentId}
            onChange={(event) =>
              setAssignmentId(event.target.value)
            }
          >
            {assignments.map((item) => (
              <option
                key={item.assignment.id}
                value={item.assignment.id}
              >
                {item.workerUser.fullName} •{' '}
                {item.assignment.status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Operations User ID
          <input
            value={actorUserId}
            onChange={(event) =>
              setActorUserId(event.target.value)
            }
            placeholder="UUID người xử lý"
          />
        </label>

        <label>
          Lý do
          <textarea
            rows={3}
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
          />
        </label>

        <div className="button-group">
          <button
            className="secondary-button danger"
            type="button"
            onClick={() => assessMutation.mutate()}
          >
            Đánh giá phí hủy
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => replaceMutation.mutate()}
          >
            Yêu cầu thay người
          </button>
        </div>
      </div>

      <div className="form-stack">
        <h3>Xử lý yêu cầu thay người</h3>

        {openReplacements.length ? (
          <>
            <div className="form-row">
              <label>
                Yêu cầu đang mở
                <select
                  value={fulfillRequestId}
                  onChange={(event) =>
                    setFulfillRequestId(event.target.value)
                  }
                >
                  <option value="">Chọn yêu cầu</option>
                  {openReplacements.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id.slice(0, 8)} • {item.priority} •{' '}
                      {item.reason}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Worker thay thế
                <input
                  value={fulfillWorkerId}
                  onChange={(event) =>
                    setFulfillWorkerId(event.target.value)
                  }
                  placeholder="UUID worker được chỉ định"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Payout thỏa thuận
                <input
                  type="number"
                  min={0}
                  value={fulfillPayout}
                  onChange={(event) =>
                    setFulfillPayout(event.target.value)
                  }
                />
              </label>
              <label>
                Khoản giữ lại (tùy chọn)
                <input
                  type="number"
                  min={0}
                  value={fulfillRetention}
                  onChange={(event) =>
                    setFulfillRetention(event.target.value)
                  }
                />
              </label>
            </div>

            {fulfillMutation.isError && (
              <div className="inline-error">
                {fulfillMutation.error instanceof Error
                  ? fulfillMutation.error.message
                  : 'Không thể xử lý thay người.'}
              </div>
            )}

            {fulfillMutation.isSuccess && (
              <div className="inline-success">
                Đã chỉ định worker thay thế.
              </div>
            )}

            <button
              className="primary-button"
              type="button"
              disabled={
                !fulfillRequestId ||
                !fulfillWorkerId ||
                !fulfillPayout ||
                fulfillMutation.isPending
              }
              onClick={() => fulfillMutation.mutate()}
            >
              <UserCheck size={17} />
              {fulfillMutation.isPending
                ? 'Đang xử lý...'
                : 'Xác nhận thay người'}
            </button>
          </>
        ) : (
          <p className="muted-text">
            Không có yêu cầu thay người đang mở.
          </p>
        )}
      </div>

      <div className="form-stack">
        <h3>Mở khiếu nại / tranh chấp</h3>

        <div className="form-row">
          <label>
            Loại
            <select
              value={disputeCaseType}
              onChange={(event) =>
                setDisputeCaseType(
                  event.target.value as 'COMPLAINT' | 'DISPUTE',
                )
              }
            >
              <option value="COMPLAINT">Khiếu nại</option>
              <option value="DISPUTE">Tranh chấp</option>
            </select>
          </label>

          <label>
            Mức ưu tiên
            <select
              value={disputePriority}
              onChange={(event) =>
                setDisputePriority(
                  event.target.value as
                    | 'NORMAL'
                    | 'HIGH'
                    | 'CRITICAL',
                )
              }
            >
              <option value="NORMAL">Bình thường</option>
              <option value="HIGH">Cao</option>
              <option value="CRITICAL">Khẩn cấp</option>
            </select>
          </label>
        </div>

        <label>
          Tiêu đề
          <input
            value={disputeSubject}
            onChange={(event) =>
              setDisputeSubject(event.target.value)
            }
            placeholder="Tóm tắt vấn đề"
          />
        </label>

        <label>
          Mô tả chi tiết
          <textarea
            rows={3}
            value={disputeDescription}
            onChange={(event) =>
              setDisputeDescription(event.target.value)
            }
            placeholder="Diễn biến, bằng chứng liên quan..."
          />
        </label>

        {disputeMutation.isError && (
          <div className="inline-error">
            {disputeMutation.error instanceof Error
              ? disputeMutation.error.message
              : 'Không thể mở khiếu nại.'}
          </div>
        )}

        {disputeMutation.isSuccess && (
          <div className="inline-success">
            Đã mở khiếu nại / tranh chấp mới.
          </div>
        )}

        <button
          className="primary-button"
          type="button"
          disabled={
            !disputeSubject ||
            !disputeDescription ||
            disputeMutation.isPending
          }
          onClick={() => disputeMutation.mutate()}
        >
          <Gavel size={17} />
          {disputeMutation.isPending
            ? 'Đang mở...'
            : 'Mở khiếu nại'}
        </button>
      </div>

      <div className="form-stack">
        <h3>Duyệt điều chỉnh tài chính</h3>

        {proposedAdjustments.length ? (
          <>
            <label>
              Điều chỉnh đang chờ duyệt
              <select
                value={approveAdjustmentId}
                onChange={(event) =>
                  setApproveAdjustmentId(event.target.value)
                }
              >
                <option value="">Chọn điều chỉnh</option>
                {proposedAdjustments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.adjustmentType} •{' '}
                    {item.amount.toLocaleString('vi-VN')} ₫ •{' '}
                    {item.reason}
                  </option>
                ))}
              </select>
            </label>

            {approveMutation.isError && (
              <div className="inline-error">
                {approveMutation.error instanceof Error
                  ? approveMutation.error.message
                  : 'Không thể duyệt điều chỉnh.'}
              </div>
            )}

            {approveMutation.isSuccess && (
              <div className="inline-success">
                Đã duyệt điều chỉnh và tạo payment.
              </div>
            )}

            <button
              className="primary-button"
              type="button"
              disabled={
                !approveAdjustmentId || approveMutation.isPending
              }
              onClick={() => approveMutation.mutate()}
            >
              <CircleDollarSign size={17} />
              {approveMutation.isPending
                ? 'Đang duyệt...'
                : 'Duyệt điều chỉnh'}
            </button>
          </>
        ) : (
          <p className="muted-text">
            Không có điều chỉnh tài chính nào đang chờ duyệt.
          </p>
        )}
      </div>

      <div className="exception-columns">
        <section>
          <h3>Cancellation assessments</h3>
          <pre>
            {JSON.stringify(data.assessments, null, 2)}
          </pre>
        </section>
        <section>
          <h3>Replacement requests</h3>
          <pre>
            {JSON.stringify(data.replacements, null, 2)}
          </pre>
        </section>
        <section>
          <h3>Disputes</h3>
          <pre>{JSON.stringify(data.cases, null, 2)}</pre>
        </section>
        <section>
          <h3>Financial adjustments</h3>
          <pre>
            {JSON.stringify(data.adjustments, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}

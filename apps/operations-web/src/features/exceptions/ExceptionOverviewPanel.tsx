import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  RefreshCcw,
  Scale,
} from 'lucide-react';
import { useState } from 'react';

import {
  ErrorState,
  LoadingState,
} from '../../components/AsyncState';
import { apiRequest } from '../../lib/api';

interface Overview {
  jobId: string;
  policyVersion: string;
  assessments: Array<Record<string, unknown>>;
  replacements: Array<Record<string, unknown>>;
  cases: Array<Record<string, unknown>>;
  adjustments: Array<Record<string, unknown>>;
}

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

  const query = useQuery({
    queryKey: ['job-exceptions', jobId],
    queryFn: () =>
      apiRequest<Overview>(`/jobs/${jobId}/exceptions`),
  });

  const assessMutation = useMutation({
    mutationFn: () =>
      apiRequest(
        `/assignments/${assignmentId}/cancellation-assessment`,
        {
          method: 'POST',
          body: JSON.stringify({
            actorUserId,
            eventType: 'CANCELLATION',
            cancelledByParty: 'CUSTOMER',
            reason,
          }),
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['job-exceptions', jobId],
      }),
  });

  const replaceMutation = useMutation({
    mutationFn: () =>
      apiRequest(
        `/assignments/${assignmentId}/replacement-requests`,
        {
          method: 'POST',
          body: JSON.stringify({
            actorUserId,
            reason,
            priority: 'HIGH',
          }),
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['job-exceptions', jobId],
      }),
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

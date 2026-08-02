import { useMutation } from '@tanstack/react-query';
import { Ban, HeartHandshake, MinusCircle } from 'lucide-react';
import { useState } from 'react';

import { jobsApi } from '../../services/jobs';

export function RelationshipPanel({
  jobId,
  customerId,
  workers,
}: {
  jobId: string;
  customerId: string;
  workers: Array<{
    workerId: string;
    workerUser: { fullName: string };
  }>;
}) {
  const [actorUserId, setActorUserId] = useState('');
  const [workerId, setWorkerId] = useState(
    workers[0]?.workerId ?? '',
  );
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: (
      preferenceType: 'PREFERRED' | 'BLOCKED' | 'NEUTRAL',
    ) =>
      jobsApi.setRelationship({
        customerId,
        workerId,
        actorUserId,
        setByParty: 'CUSTOMER',
        preferenceType,
        sourceJobId: jobId,
        reason,
      }),
  });

  return (
    <div className="form-stack">
      <label>
        Worker
        <select
          value={workerId}
          onChange={(event) => setWorkerId(event.target.value)}
        >
          {workers.map((worker) => (
            <option key={worker.workerId} value={worker.workerId}>
              {worker.workerUser.fullName}
            </option>
          ))}
        </select>
      </label>

      <label>
        Customer User ID
        <input
          value={actorUserId}
          onChange={(event) =>
            setActorUserId(event.target.value)
          }
          placeholder="UUID chủ công việc"
        />
      </label>

      <label>
        Lý do
        <textarea
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Lý do ưu tiên hoặc không ghép lại..."
        />
      </label>

      <div className="button-group">
        <button
          className="secondary-button preferred"
          type="button"
          onClick={() => mutation.mutate('PREFERRED')}
        >
          <HeartHandshake size={17} />
          Ưu tiên
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => mutation.mutate('NEUTRAL')}
        >
          <MinusCircle size={17} />
          Trung lập
        </button>
        <button
          className="secondary-button danger"
          type="button"
          onClick={() => mutation.mutate('BLOCKED')}
        >
          <Ban size={17} />
          Không ghép lại
        </button>
      </div>

      {mutation.isSuccess && (
        <div className="inline-success">
          Quan hệ đã được cập nhật.
        </div>
      )}

      {mutation.isError && (
        <div className="inline-error">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Không thể cập nhật quan hệ.'}
        </div>
      )}
    </div>
  );
}

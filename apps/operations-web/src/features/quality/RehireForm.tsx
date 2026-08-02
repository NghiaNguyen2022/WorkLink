import { useMutation } from '@tanstack/react-query';
import { CopyPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { jobsApi } from '../../services/jobs';

export function RehireForm({
  jobId,
  workers,
}: {
  jobId: string;
  workers: Array<{
    workerId: string;
    workerUser: { fullName: string };
  }>;
}) {
  const navigate = useNavigate();
  const [requestedByUserId, setRequestedByUserId] = useState('');
  const [preferredWorkerId, setPreferredWorkerId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [title, setTitle] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      jobsApi.rehire(jobId, {
        requestedByUserId,
        preferredWorkerId: preferredWorkerId || undefined,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        title: title || undefined,
      }),
    onSuccess: (result) => {
      navigate(`/jobs/${result.newJobId}`);
    },
  });

  return (
    <div className="form-stack">
      <label>
        Customer User ID
        <input
          value={requestedByUserId}
          onChange={(event) =>
            setRequestedByUserId(event.target.value)
          }
          placeholder="UUID chủ công việc"
        />
      </label>

      <label>
        Worker ưu tiên
        <select
          value={preferredWorkerId}
          onChange={(event) =>
            setPreferredWorkerId(event.target.value)
          }
        >
          <option value="">Không chỉ định</option>
          {workers.map((worker) => (
            <option key={worker.workerId} value={worker.workerId}>
              {worker.workerUser.fullName}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tiêu đề mới
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Để trống để dùng tiêu đề cũ"
        />
      </label>

      <div className="form-row">
        <label>
          Bắt đầu
          <input
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
          />
        </label>
        <label>
          Kết thúc
          <input
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
          />
        </label>
      </div>

      {mutation.isError && (
        <div className="inline-error">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Không thể tạo Job thuê lại.'}
        </div>
      )}

      <button
        className="primary-button"
        type="button"
        disabled={!startAt || !endAt || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <CopyPlus size={17} />
        {mutation.isPending
          ? 'Đang tạo...'
          : 'Tạo Job thuê lại'}
      </button>
    </div>
  );
}

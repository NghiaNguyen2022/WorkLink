import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { customerPortalApi } from '../services/customerPortal';
import { useCustomerSession } from '../session/CustomerSession';

export function CreateJobPage() {
  const session = useCustomerSession();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');
  const [headcount, setHeadcount] = useState(1);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [budget, setBudget] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      customerPortalApi.createJob(
        session.customerId,
        {
          categoryId,
          locationId,
          title,
          description,
          headcount,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          customerBudget: budget
            ? Number(budget)
            : undefined,
          requirements: [],
        },
      ),
    onSuccess: (result) => {
      navigate(`/jobs/${result.job.id}`);
    },
  });

  return (
    <>
      <div className="page-heading">
        <span>NEW REQUEST</span>
        <h1>Đăng nhu cầu nhân sự</h1>
        <p>
          Tạo bản nháp trước, sau đó kiểm tra và gửi xác minh.
        </p>
      </div>

      <section className="customer-card form-stack">
        <div className="form-row">
          <label>
            Category ID
            <input
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
            />
          </label>
          <label>
            Location ID
            <input
              value={locationId}
              onChange={(event) =>
                setLocationId(event.target.value)
              }
            />
          </label>
        </div>
        <label>
          Tiêu đề
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
          />
        </label>
        <label>
          Mô tả công việc
          <textarea
            rows={5}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </label>
        <div className="form-row three">
          <label>
            Số lượng
            <input
              type="number"
              min={1}
              value={headcount}
              onChange={(event) =>
                setHeadcount(Number(event.target.value))
              }
            />
          </label>
          <label>
            Bắt đầu
            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) =>
                setStartAt(event.target.value)
              }
            />
          </label>
          <label>
            Kết thúc
            <input
              type="datetime-local"
              value={endAt}
              onChange={(event) =>
                setEndAt(event.target.value)
              }
            />
          </label>
        </div>
        <label>
          Ngân sách dự kiến
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(event) =>
              setBudget(event.target.value)
            }
          />
        </label>

        {mutation.isError && (
          <div className="inline-error">
            {mutation.error.message}
          </div>
        )}

        <button
          className="primary-button"
          type="button"
          disabled={
            !categoryId ||
            !locationId ||
            !title ||
            !description ||
            !startAt ||
            !endAt
          }
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending
            ? 'Đang tạo...'
            : 'Lưu bản nháp'}
        </button>
      </section>
    </>
  );
}

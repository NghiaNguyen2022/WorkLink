import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { jobsApi } from '../../services/jobs';

const schema = z.object({
  reviewerUserId: z.string().uuid('User ID không hợp lệ'),
  assignmentId: z.string().uuid('Assignment ID không hợp lệ'),
  reviewerType: z.enum([
    'CUSTOMER_TO_WORKER',
    'WORKER_TO_CUSTOMER',
  ]),
  overallRating: z.coerce.number().min(1).max(5),
  punctuality: z.coerce.number().min(1).max(5),
  quality: z.coerce.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
  wouldHireAgain: z.boolean().optional(),
});

type FormValue = z.infer<typeof schema>;

export function ReviewForm({
  jobId,
  assignments,
}: {
  jobId: string;
  assignments: Array<{
    assignment: { id: string };
    workerUser: { fullName: string };
  }>;
}) {
  const queryClient = useQueryClient();
  const form = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      reviewerType: 'CUSTOMER_TO_WORKER',
      overallRating: 5,
      punctuality: 5,
      quality: 5,
      wouldHireAgain: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (value: FormValue) =>
      jobsApi.createReview(jobId, {
        reviewerUserId: value.reviewerUserId,
        assignmentId: value.assignmentId,
        reviewerType: value.reviewerType,
        overallRating: value.overallRating,
        criteria: {
          punctuality: value.punctuality,
          quality: value.quality,
        },
        comment: value.comment,
        wouldHireAgain: value.wouldHireAgain,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['job-reviews', jobId],
      });
      form.reset();
    },
  });

  return (
    <form
      className="form-stack"
      onSubmit={form.handleSubmit((value) =>
        mutation.mutate(value),
      )}
    >
      <div className="form-row">
        <label>
          Loại đánh giá
          <select {...form.register('reviewerType')}>
            <option value="CUSTOMER_TO_WORKER">
              Khách hàng đánh giá Worker
            </option>
            <option value="WORKER_TO_CUSTOMER">
              Worker đánh giá khách hàng
            </option>
          </select>
        </label>

        <label>
          Assignment
          <select {...form.register('assignmentId')}>
            <option value="">Chọn assignment</option>
            {assignments.map((item) => (
              <option
                key={item.assignment.id}
                value={item.assignment.id}
              >
                {item.workerUser.fullName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Reviewer User ID
        <input
          placeholder="UUID của người đánh giá"
          {...form.register('reviewerUserId')}
        />
      </label>

      <div className="form-row three">
        <label>
          Điểm chung
          <input
            type="number"
            min={1}
            max={5}
            {...form.register('overallRating')}
          />
        </label>
        <label>
          Đúng giờ
          <input
            type="number"
            min={1}
            max={5}
            {...form.register('punctuality')}
          />
        </label>
        <label>
          Chất lượng
          <input
            type="number"
            min={1}
            max={5}
            {...form.register('quality')}
          />
        </label>
      </div>

      <label>
        Nhận xét
        <textarea
          rows={4}
          placeholder="Ghi nhận thực tế sau công việc..."
          {...form.register('comment')}
        />
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          {...form.register('wouldHireAgain')}
        />
        Sẵn sàng thuê lại
      </label>

      {mutation.isError && (
        <div className="inline-error">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Không thể gửi đánh giá.'}
        </div>
      )}

      {mutation.isSuccess && (
        <div className="inline-success">
          Đã ghi nhận đánh giá và cập nhật metric.
        </div>
      )}

      <button className="primary-button" type="submit">
        <Star size={17} />
        {mutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
}

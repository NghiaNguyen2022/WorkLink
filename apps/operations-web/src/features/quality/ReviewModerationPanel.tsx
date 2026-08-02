import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  EyeOff,
  Flag,
  Send,
} from 'lucide-react';
import { useState } from 'react';

import { jobsApi } from '../../services/jobs';
import type { Review } from '../../types/worklink';

export function ReviewModerationPanel({
  jobId,
  reviews,
}: {
  jobId: string;
  reviews: Review[];
}) {
  const queryClient = useQueryClient();
  const [reviewId, setReviewId] = useState(
    reviews[0]?.id ?? '',
  );
  const [actorUserId, setActorUserId] = useState('');
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: (status: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN') =>
      jobsApi.moderateReview(reviewId, {
        actorUserId,
        status,
        reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['job-reviews', jobId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['job-quality-overview', jobId],
      });
    },
  });

  if (!reviews.length) {
    return (
      <p className="muted-text">
        Chưa có Review để moderation.
      </p>
    );
  }

  return (
    <div className="form-stack">
      <label>
        Review
        <select
          value={reviewId}
          onChange={(event) => setReviewId(event.target.value)}
        >
          {reviews.map((review) => (
            <option key={review.id} value={review.id}>
              {review.reviewerType} • {review.overallRating}/5
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
          placeholder="UUID người moderation"
        />
      </label>

      <label>
        Lý do
        <textarea
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Bắt buộc ghi lý do thay đổi trạng thái..."
        />
      </label>

      <div className="button-group">
        <button
          className="secondary-button preferred"
          type="button"
          onClick={() => mutation.mutate('PUBLISHED')}
        >
          <Send size={17} />
          Publish
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => mutation.mutate('FLAGGED')}
        >
          <Flag size={17} />
          Flag
        </button>
        <button
          className="secondary-button danger"
          type="button"
          onClick={() => mutation.mutate('HIDDEN')}
        >
          <EyeOff size={17} />
          Hide
        </button>
      </div>

      {mutation.isSuccess && (
        <div className="inline-success">
          Đã cập nhật trạng thái Review.
        </div>
      )}

      {mutation.isError && (
        <div className="inline-error">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Không thể moderate Review.'}
        </div>
      )}
    </div>
  );
}

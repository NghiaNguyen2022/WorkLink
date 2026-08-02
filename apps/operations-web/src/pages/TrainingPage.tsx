import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Award,
  BookOpenCheck,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';

import {
  ErrorState,
  LoadingState,
} from '../components/AsyncState';
import { apiRequest } from '../lib/api';

interface Course {
  id: string;
  courseCode: string;
  title: string;
  deliveryMode: string;
  durationMinutes: number;
  passingScore: number;
  certificationCode?: string | null;
  active: boolean;
}

export function TrainingPage() {
  const queryClient = useQueryClient();
  const [actorUserId, setActorUserId] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [certificationCode, setCertificationCode] =
    useState('');
  const [skillCode, setSkillCode] = useState('');

  const query = useQuery({
    queryKey: ['training-courses'],
    queryFn: () =>
      apiRequest<Course[]>('/training/courses'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest<Course>('/training/courses', {
        method: 'POST',
        body: JSON.stringify({
          actorUserId,
          courseCode,
          title,
          certificationCode:
            certificationCode || undefined,
          skillCode: skillCode || undefined,
          deliveryMode: 'BLENDED',
          durationMinutes: 120,
          passingScore: 70,
          certificateValidityDays: 365,
        }),
      }),
    onSuccess: () => {
      setCourseCode('');
      setTitle('');
      setCertificationCode('');
      setSkillCode('');
      void queryClient.invalidateQueries({
        queryKey: ['training-courses'],
      });
    },
  });

  if (query.isLoading) {
    return <LoadingState label="Đang tải khóa học..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={
          query.error instanceof Error
            ? query.error.message
            : 'Không tải được khóa học.'
        }
      />
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            TRAINING & CERTIFICATION
          </span>
          <h1>Đào tạo và chứng nhận</h1>
          <p>
            Quản lý khóa học, bài kiểm tra, chứng nhận và
            điều kiện Matching.
          </p>
        </div>
      </div>

      <div className="training-summary">
        <div>
          <BookOpenCheck />
          <span>Khóa học</span>
          <strong>{query.data?.length ?? 0}</strong>
        </div>
        <div>
          <GraduationCap />
          <span>Đang hoạt động</span>
          <strong>
            {query.data?.filter((item) => item.active).length ??
              0}
          </strong>
        </div>
        <div>
          <Award />
          <span>Có chứng nhận</span>
          <strong>
            {query.data?.filter(
              (item) => item.certificationCode,
            ).length ?? 0}
          </strong>
        </div>
      </div>

      <div className="detail-grid">
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Tạo khóa học</h2>
              <p>
                Khóa học có thể gắn kỹ năng và chứng nhận.
              </p>
            </div>
          </div>

          <div className="form-stack">
            <label>
              Operations User ID
              <input
                value={actorUserId}
                onChange={(event) =>
                  setActorUserId(event.target.value)
                }
              />
            </label>
            <label>
              Mã khóa học
              <input
                value={courseCode}
                onChange={(event) =>
                  setCourseCode(event.target.value)
                }
              />
            </label>
            <label>
              Tên khóa học
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </label>
            <div className="form-row">
              <label>
                Skill code
                <input
                  value={skillCode}
                  onChange={(event) =>
                    setSkillCode(event.target.value)
                  }
                />
              </label>
              <label>
                Certification code
                <input
                  value={certificationCode}
                  onChange={(event) =>
                    setCertificationCode(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <button
              className="primary-button"
              type="button"
              disabled={
                !actorUserId || !courseCode || !title
              }
              onClick={() => createMutation.mutate()}
            >
              Tạo khóa học
            </button>
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Danh sách khóa học</h2>
              <p>
                Chứng nhận có thể được dùng làm hard filter.
              </p>
            </div>
          </div>

          <div className="course-list">
            {query.data?.map((course) => (
              <article className="course-card" key={course.id}>
                <div>
                  <strong>{course.title}</strong>
                  <span>{course.courseCode}</span>
                </div>
                <p>
                  {course.deliveryMode} •{' '}
                  {course.durationMinutes} phút • Pass{' '}
                  {course.passingScore}%
                </p>
                <small>
                  {course.certificationCode ??
                    'Không cấp chứng nhận'}
                </small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

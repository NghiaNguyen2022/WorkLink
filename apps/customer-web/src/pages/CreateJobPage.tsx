import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { catalogApi } from '../services/catalog';
import { customerPortalApi } from '../services/customerPortal';
import { useCustomerSession } from '../session/CustomerSession';
import type { JobRequirementInput } from '../types/customer';

const REQUIREMENT_TYPES = [
  { value: 'SKILL', label: 'Kỹ năng' },
  { value: 'CERTIFICATE', label: 'Chứng chỉ' },
  { value: 'BEHAVIOR', label: 'Tác phong' },
  { value: 'EXPERIENCE', label: 'Kinh nghiệm' },
];

const MINIMUM_LEVELS = [
  { value: '', label: 'Không yêu cầu mức' },
  { value: 'BASIC', label: 'Cơ bản' },
  { value: 'INTERMEDIATE', label: 'Trung bình' },
  { value: 'ADVANCED', label: 'Nâng cao' },
  { value: 'EXPERT', label: 'Chuyên sâu' },
];

export function CreateJobPage() {
  const session = useCustomerSession();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');

  const categoriesQuery = useQuery({
    queryKey: ['job-categories'],
    queryFn: () => catalogApi.categories(),
  });

  const locationsQuery = useQuery({
    queryKey: ['customer-locations', session.customerId],
    queryFn: () =>
      customerPortalApi.locations(session.customerId),
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');
  const [headcount, setHeadcount] = useState(1);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [budget, setBudget] = useState('');

  const [requirements, setRequirements] = useState<
    JobRequirementInput[]
  >([]);
  const [reqType, setReqType] = useState('SKILL');
  const [reqDescription, setReqDescription] =
    useState('');
  const [reqMandatory, setReqMandatory] = useState(true);
  const [reqMinimumLevel, setReqMinimumLevel] =
    useState('');

  const addRequirement = () => {
    if (!reqDescription) {
      return;
    }

    setRequirements((current) => [
      ...current,
      {
        requirementType: reqType,
        description: reqDescription,
        mandatory: reqMandatory,
        minimumLevel: reqMinimumLevel || undefined,
      },
    ]);
    setReqDescription('');
    setReqMandatory(true);
    setReqMinimumLevel('');
  };

  const removeRequirement = (index: number) => {
    setRequirements((current) =>
      current.filter((_, i) => i !== index),
    );
  };

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
          requirements,
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
            Danh mục công việc
            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
            >
              <option value="">Chọn danh mục</option>
              {categoriesQuery.data?.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Địa điểm làm việc
            <select
              value={locationId}
              onChange={(event) =>
                setLocationId(event.target.value)
              }
            >
              <option value="">Chọn địa điểm</option>
              {locationsQuery.data?.map((location) => (
                <option
                  key={location.id}
                  value={location.id}
                >
                  {location.label} — {location.addressLine}
                </option>
              ))}
            </select>
            {locationsQuery.data?.length === 0 && (
              <small>
                Chưa có địa điểm nào, hãy thêm tại mục Địa
                điểm.
              </small>
            )}
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

        <div className="requirement-builder">
          <h2>Yêu cầu công việc</h2>
          <p>
            Thêm các yêu cầu về kỹ năng, chứng chỉ hoặc tác
            phong (không bắt buộc).
          </p>

          {requirements.length > 0 && (
            <div className="requirement-list">
              {requirements.map((item, index) => (
                <div
                  key={index}
                  className="requirement-row"
                >
                  <div>
                    <strong>
                      {
                        REQUIREMENT_TYPES.find(
                          (type) =>
                            type.value ===
                            item.requirementType,
                        )?.label
                      }
                    </strong>
                    {item.mandatory ? (
                      <span className="requirement-tag mandatory">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="requirement-tag">
                        Tùy chọn
                      </span>
                    )}
                    {item.minimumLevel && (
                      <span className="requirement-tag">
                        {
                          MINIMUM_LEVELS.find(
                            (level) =>
                              level.value ===
                              item.minimumLevel,
                          )?.label
                        }
                      </span>
                    )}
                    <p>{item.description}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button danger"
                    onClick={() =>
                      removeRequirement(index)
                    }
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-row three">
            <label>
              Loại yêu cầu
              <select
                value={reqType}
                onChange={(event) =>
                  setReqType(event.target.value)
                }
              >
                {REQUIREMENT_TYPES.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mức tối thiểu
              <select
                value={reqMinimumLevel}
                onChange={(event) =>
                  setReqMinimumLevel(event.target.value)
                }
              >
                {MINIMUM_LEVELS.map((level) => (
                  <option
                    key={level.value}
                    value={level.value}
                  >
                    {level.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={reqMandatory}
                onChange={(event) =>
                  setReqMandatory(event.target.checked)
                }
              />
              Bắt buộc
            </label>
          </div>
          <label>
            Mô tả yêu cầu
            <input
              value={reqDescription}
              onChange={(event) =>
                setReqDescription(event.target.value)
              }
              placeholder="Ví dụ: Đã xác minh kỹ năng lễ tân sự kiện"
            />
          </label>
          <button
            type="button"
            className="secondary-button"
            disabled={!reqDescription}
            onClick={addRequirement}
          >
            Thêm yêu cầu
          </button>
        </div>

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

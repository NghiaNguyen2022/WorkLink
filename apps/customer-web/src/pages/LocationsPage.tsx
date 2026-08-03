import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';

import { customerPortalApi } from '../services/customerPortal';
import { useCustomerSession } from '../session/CustomerSession';
import type { CustomerLocation } from '../types/customer';

const EMPTY_FORM = {
  label: '',
  contactName: '',
  contactPhone: '',
  addressLine: '',
  ward: '',
  district: '',
  city: '',
  isDefault: false,
};

export function LocationsPage() {
  const session = useCustomerSession();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );

  const query = useQuery({
    queryKey: ['customer-locations', session.customerId],
    queryFn: () =>
      customerPortalApi.locations(session.customerId),
  });

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['customer-locations', session.customerId],
    });

  const createMutation = useMutation({
    mutationFn: () =>
      customerPortalApi.createLocation(
        session.customerId,
        form,
      ),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      refresh();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: {
      locationId: string;
      body: Record<string, unknown>;
    }) =>
      customerPortalApi.updateLocation(
        session.customerId,
        input.locationId,
        input.body,
      ),
    onSuccess: () => {
      setEditingId(null);
      refresh();
    },
  });

  const startEdit = (location: CustomerLocation) => {
    setEditingId(location.id);
  };

  return (
    <>
      <div className="page-heading">
        <span>LOCATIONS</span>
        <h1>Địa điểm làm việc</h1>
        <p>
          Quản lý các địa điểm dùng khi đăng nhu cầu nhân sự.
        </p>
      </div>

      {query.isLoading && (
        <div className="state-card">Đang tải...</div>
      )}
      {query.isError && (
        <div className="state-card error">
          {query.error.message}
        </div>
      )}

      <div className="stack-list">
        {query.data?.map((location) =>
          editingId === location.id ? (
            <LocationEditForm
              key={location.id}
              location={location}
              onCancel={() => setEditingId(null)}
              onSave={(body) =>
                updateMutation.mutate({
                  locationId: location.id,
                  body,
                })
              }
              saving={updateMutation.isPending}
            />
          ) : (
            <article key={location.id}>
              <div>
                <strong>{location.label}</strong>
                {location.isDefault && (
                  <span className="customer-status status-approved">
                    MẶC ĐỊNH
                  </span>
                )}
              </div>
              <p>{location.addressLine}</p>
              <small>
                {[
                  location.ward,
                  location.district,
                  location.city,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </small>
              <small>
                Liên hệ: {location.contactName} —{' '}
                {location.contactPhone}
              </small>
              <button
                className="secondary-button"
                type="button"
                onClick={() => startEdit(location)}
              >
                Sửa
              </button>
            </article>
          ),
        )}
      </div>

      <section className="customer-card form-stack">
        <h2>Thêm địa điểm mới</h2>
        <div className="form-row">
          <label>
            Tên địa điểm
            <input
              value={form.label}
              onChange={(event) =>
                setForm({
                  ...form,
                  label: event.target.value,
                })
              }
            />
          </label>
          <label>
            Người liên hệ
            <input
              value={form.contactName}
              onChange={(event) =>
                setForm({
                  ...form,
                  contactName: event.target.value,
                })
              }
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Số điện thoại liên hệ
            <input
              value={form.contactPhone}
              onChange={(event) =>
                setForm({
                  ...form,
                  contactPhone: event.target.value,
                })
              }
            />
          </label>
          <label>
            Địa chỉ
            <input
              value={form.addressLine}
              onChange={(event) =>
                setForm({
                  ...form,
                  addressLine: event.target.value,
                })
              }
            />
          </label>
        </div>
        <div className="form-row three">
          <label>
            Phường/Xã
            <input
              value={form.ward}
              onChange={(event) =>
                setForm({
                  ...form,
                  ward: event.target.value,
                })
              }
            />
          </label>
          <label>
            Quận/Huyện
            <input
              value={form.district}
              onChange={(event) =>
                setForm({
                  ...form,
                  district: event.target.value,
                })
              }
            />
          </label>
          <label>
            Tỉnh/Thành phố
            <input
              value={form.city}
              onChange={(event) =>
                setForm({
                  ...form,
                  city: event.target.value,
                })
              }
            />
          </label>
        </div>
        <label>
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) =>
              setForm({
                ...form,
                isDefault: event.target.checked,
              })
            }
          />{' '}
          Đặt làm địa điểm mặc định
        </label>

        {createMutation.isError && (
          <div className="inline-error">
            {createMutation.error.message}
          </div>
        )}

        <button
          className="primary-button"
          type="button"
          disabled={
            !form.label ||
            !form.contactName ||
            !form.contactPhone ||
            !form.addressLine ||
            !form.district ||
            !form.city ||
            createMutation.isPending
          }
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending
            ? 'Đang thêm...'
            : 'Thêm địa điểm'}
        </button>
      </section>
    </>
  );
}

function LocationEditForm({
  location,
  onCancel,
  onSave,
  saving,
}: {
  location: CustomerLocation;
  onCancel: () => void;
  onSave: (body: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    label: location.label,
    contactName: location.contactName,
    contactPhone: location.contactPhone,
    addressLine: location.addressLine,
    ward: location.ward ?? '',
    district: location.district,
    city: location.city,
    isDefault: location.isDefault,
  });

  return (
    <article className="form-stack">
      <div className="form-row">
        <label>
          Tên địa điểm
          <input
            value={form.label}
            onChange={(event) =>
              setForm({
                ...form,
                label: event.target.value,
              })
            }
          />
        </label>
        <label>
          Người liên hệ
          <input
            value={form.contactName}
            onChange={(event) =>
              setForm({
                ...form,
                contactName: event.target.value,
              })
            }
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Số điện thoại liên hệ
          <input
            value={form.contactPhone}
            onChange={(event) =>
              setForm({
                ...form,
                contactPhone: event.target.value,
              })
            }
          />
        </label>
        <label>
          Địa chỉ
          <input
            value={form.addressLine}
            onChange={(event) =>
              setForm({
                ...form,
                addressLine: event.target.value,
              })
            }
          />
        </label>
      </div>
      <div className="form-row three">
        <label>
          Phường/Xã
          <input
            value={form.ward}
            onChange={(event) =>
              setForm({
                ...form,
                ward: event.target.value,
              })
            }
          />
        </label>
        <label>
          Quận/Huyện
          <input
            value={form.district}
            onChange={(event) =>
              setForm({
                ...form,
                district: event.target.value,
              })
            }
          />
        </label>
        <label>
          Tỉnh/Thành phố
          <input
            value={form.city}
            onChange={(event) =>
              setForm({
                ...form,
                city: event.target.value,
              })
            }
          />
        </label>
      </div>
      <label>
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(event) =>
            setForm({
              ...form,
              isDefault: event.target.checked,
            })
          }
        />{' '}
        Đặt làm địa điểm mặc định
      </label>
      <div className="button-group">
        <button
          className="primary-button"
          type="button"
          disabled={saving}
          onClick={() => onSave(form)}
        >
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </article>
  );
}

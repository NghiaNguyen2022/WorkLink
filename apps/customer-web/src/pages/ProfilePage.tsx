import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { customerPortalApi } from '../services/customerPortal';
import { useCustomerSession } from '../session/CustomerSession';

export function ProfilePage() {
  const session = useCustomerSession();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  const query = useQuery({
    queryKey: ['customer-profile', session.customerId],
    queryFn: () =>
      customerPortalApi.profile(session.customerId),
  });

  useEffect(() => {
    if (query.data) {
      setDisplayName(query.data.displayName);
      setCompanyName(query.data.companyName ?? '');
      setPhone(query.data.phone ?? '');
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: () =>
      customerPortalApi.updateProfile(
        session.customerId,
        {
          displayName,
          companyName,
          phone,
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['customer-profile', session.customerId],
      }),
  });

  if (query.isLoading) {
    return <div className="state-card">Đang tải...</div>;
  }

  if (query.isError) {
    return (
      <div className="state-card error">
        {query.error.message}
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <span>ACCOUNT</span>
        <h1>Hồ sơ khách hàng</h1>
        <p>Cập nhật thông tin liên hệ và doanh nghiệp.</p>
      </div>

      <section className="customer-card form-stack">
        <div className="form-row">
          <label>
            Email
            <input value={query.data?.email ?? ''} disabled />
          </label>
          <label>
            Trạng thái xác minh
            <input
              value={query.data?.verificationStatus ?? ''}
              disabled
            />
          </label>
        </div>
        <label>
          Tên hiển thị
          <input
            value={displayName}
            onChange={(event) =>
              setDisplayName(event.target.value)
            }
          />
        </label>
        <label>
          Tên công ty
          <input
            value={companyName}
            onChange={(event) =>
              setCompanyName(event.target.value)
            }
          />
        </label>
        <label>
          Số điện thoại
          <input
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
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
          disabled={!displayName || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending
            ? 'Đang lưu...'
            : 'Lưu thay đổi'}
        </button>

        {mutation.isSuccess && (
          <div className="floating-message success">
            Cập nhật hồ sơ thành công.
          </div>
        )}
      </section>
    </>
  );
}

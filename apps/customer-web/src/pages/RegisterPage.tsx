import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCustomerSession } from '../session/CustomerSession';

export function RegisterPage() {
  const navigate = useNavigate();
  const session = useCustomerSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [customerType, setCustomerType] = useState<
    'INDIVIDUAL' | 'BUSINESS'
  >('INDIVIDUAL');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      await session.register({
        email,
        password,
        fullName,
        phone: phone || undefined,
        displayName,
        customerType,
      });
      navigate('/dashboard');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Đăng ký thất bại',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="session-page">
      <section>
        <div className="customer-brand large">
          <div>W</div>
          <span>
            <strong>WorkLink</strong>
            <small>Customer Portal</small>
          </span>
        </div>
        <h1>Đăng ký tài khoản khách hàng</h1>
        <label>
          Họ tên
          <input
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
          />
        </label>
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
          Loại khách hàng
          <select
            value={customerType}
            onChange={(event) =>
              setCustomerType(
                event.target.value as
                  | 'INDIVIDUAL'
                  | 'BUSINESS',
              )
            }
          >
            <option value="INDIVIDUAL">Cá nhân</option>
            <option value="BUSINESS">Doanh nghiệp</option>
          </select>
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
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </label>

        {error && (
          <div className="inline-error">{error}</div>
        )}

        <button
          className="primary-button"
          type="button"
          disabled={
            !email ||
            !password ||
            !fullName ||
            !displayName ||
            submitting
          }
          onClick={handleSubmit}
        >
          {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </section>
    </div>
  );
}

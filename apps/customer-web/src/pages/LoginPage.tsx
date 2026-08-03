import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCustomerSession } from '../session/CustomerSession';

export function LoginPage() {
  const navigate = useNavigate();
  const session = useCustomerSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      await session.login(email, password);
      navigate('/dashboard');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Đăng nhập thất bại',
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
        <h1>Đăng nhập</h1>
        <p>Đăng nhập bằng tài khoản khách hàng WorkLink.</p>
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
          disabled={!email || !password || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </section>
    </div>
  );
}

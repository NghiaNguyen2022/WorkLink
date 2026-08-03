import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useOperatorSession } from '../session/OperatorSession';

export function LoginPage() {
  const navigate = useNavigate();
  const session = useOperatorSession();
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
    <div className="login-page">
      <section className="login-card">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <strong>WorkLink</strong>
            <span>Workforce Operations</span>
          </div>
        </div>
        <h1>Đăng nhập</h1>
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
      </section>
    </div>
  );
}

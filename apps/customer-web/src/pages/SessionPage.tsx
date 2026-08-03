import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCustomerSession } from '../session/CustomerSession';

export function SessionPage() {
  const navigate = useNavigate();
  const session = useCustomerSession();
  const [customerId, setCustomerId] = useState(
    session.customerId,
  );
  const [customerUserId, setCustomerUserId] =
    useState(session.customerUserId);

  return (
    <div className="session-page">
      <section>
        <div className="customer-brand large">
          <div>W</div>
          <span>
            <strong>WorkLink</strong>
            <small>Customer Portal UAT</small>
          </span>
        </div>
        <h1>Thiết lập phiên khách hàng</h1>
        <p>
          Tạm dùng Customer ID và User ID trong giai đoạn chưa
          tích hợp JWT.
        </p>
        <label>
          Customer ID
          <input
            value={customerId}
            onChange={(event) =>
              setCustomerId(event.target.value)
            }
          />
        </label>
        <label>
          Customer User ID
          <input
            value={customerUserId}
            onChange={(event) =>
              setCustomerUserId(event.target.value)
            }
          />
        </label>
        <button
          className="primary-button"
          type="button"
          disabled={!customerId || !customerUserId}
          onClick={() => {
            session.setSession(
              customerId,
              customerUserId,
            );
            navigate('/dashboard');
          }}
        >
          Vào Customer Portal
        </button>
      </section>
    </div>
  );
}

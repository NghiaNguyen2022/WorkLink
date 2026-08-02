import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <strong>404</strong>
      <h1>Không tìm thấy trang</h1>
      <Link className="primary-button" to="/dashboard">
        Về tổng quan
      </Link>
    </div>
  );
}

import {
  BriefcaseBusiness,
  CircleCheckBig,
  Handshake,
  Star,
} from 'lucide-react';

const cards = [
  {
    label: 'Công việc đang chạy',
    value: '—',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Hoàn tất hôm nay',
    value: '—',
    icon: CircleCheckBig,
  },
  {
    label: 'Đánh giá chờ xử lý',
    value: '—',
    icon: Star,
  },
  {
    label: 'Quan hệ ưu tiên',
    value: '—',
    icon: Handshake,
  },
];

export function DashboardPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKFORCE OPERATIONS</span>
          <h1>Tổng quan vận hành</h1>
          <p>
            Theo dõi công việc, chất lượng dịch vụ và quan hệ thuê lại
            trong một luồng.
          </p>
        </div>
      </div>

      <div className="metric-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className="metric-card" key={card.label}>
              <div className="metric-icon">
                <Icon size={20} />
              </div>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </article>
          );
        })}
      </div>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Baseline 07</h2>
            <p>
              Đánh giá hai chiều, hồ sơ chất lượng, preferred/block và
              re-hire.
            </p>
          </div>
        </div>
        <div className="flow-strip">
          {[
            'Job hoàn tất',
            'Đánh giá',
            'Cập nhật metric',
            'Quan hệ',
            'Thuê lại',
          ].map((item, index) => (
            <div className="flow-item" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

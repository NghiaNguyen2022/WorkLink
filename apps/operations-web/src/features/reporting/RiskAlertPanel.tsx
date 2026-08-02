import {
  AlertTriangle,
  BadgeAlert,
  CircleAlert,
  ShieldAlert,
} from 'lucide-react';

import type { RiskAlert } from '../../types/reporting';

const icons = {
  LOW: CircleAlert,
  MEDIUM: AlertTriangle,
  HIGH: BadgeAlert,
  CRITICAL: ShieldAlert,
};

export function RiskAlertPanel({
  alerts,
}: {
  alerts: RiskAlert[];
}) {
  return (
    <div className="risk-alert-list">
      {alerts.length ? (
        alerts.map((alert, index) => {
          const Icon = icons[alert.severity];

          return (
            <article
              className={`risk-alert risk-${alert.severity.toLowerCase()}`}
              key={`${alert.code}-${alert.entityId}-${index}`}
            >
              <Icon size={20} />
              <div>
                <div>
                  <strong>{alert.title}</strong>
                  <span>{alert.severity}</span>
                </div>
                <p>{alert.detail}</p>
                <small>
                  {alert.entityType} • {alert.entityId}
                </small>
              </div>
            </article>
          );
        })
      ) : (
        <p className="muted-text">
          Không có cảnh báo trong khoảng thời gian này.
        </p>
      )}
    </div>
  );
}

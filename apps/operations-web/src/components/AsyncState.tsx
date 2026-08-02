import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';

export function LoadingState({
  label = 'Đang tải dữ liệu...',
}: {
  label?: string;
}) {
  return (
    <div className="state-card">
      <LoaderCircle className="spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="state-card error">
      <AlertCircle />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="state-card">
      <Inbox />
      <span>{message}</span>
    </div>
  );
}

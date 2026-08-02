const statusLabels: Record<string, string> = {
  DRAFT: 'Bản nháp',
  MATCHING: 'Đang ghép',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  PUBLISHED: 'Đã công bố',
  FLAGGED: 'Cần xem xét',
  HIDDEN: 'Đã ẩn',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

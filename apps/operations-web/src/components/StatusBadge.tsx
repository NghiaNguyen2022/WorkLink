const statusLabels: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PENDING_VERIFICATION: 'Chờ xác minh',
  PENDING_INFORMATION: 'Chờ bổ sung',
  VERIFIED: 'Đã xác minh',
  PRICED: 'Đã báo giá',
  PENDING_CUSTOMER_APPROVAL: 'Chờ duyệt giá',
  MATCHING: 'Đang ghép',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  PUBLISHED: 'Đã công bố',
  FLAGGED: 'Cần xem xét',
  HIDDEN: 'Đã ẩn',
};

export function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalizedStatus =
    typeof status === 'string' && status.trim()
      ? status.trim().toUpperCase()
      : 'UNKNOWN';

  return (
    <span
      className={`status-badge status-${normalizedStatus.toLowerCase()}`}
    >
      {statusLabels[normalizedStatus] ??
        (normalizedStatus === 'UNKNOWN'
          ? 'Chưa xác định'
          : normalizedStatus)}
    </span>
  );
}

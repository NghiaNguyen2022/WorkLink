export function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalized =
    status?.trim().toUpperCase() || 'UNKNOWN';

  return (
    <span
      className={`customer-status status-${normalized.toLowerCase()}`}
    >
      {normalized.replaceAll('_', ' ')}
    </span>
  );
}

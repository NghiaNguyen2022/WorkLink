import { apiRequest } from '../lib/api';
import type { ReportingDashboard } from '../types/reporting';

function queryString(input: {
  from?: string;
  to?: string;
}) {
  const query = new URLSearchParams();

  if (input.from) {
    query.set('from', input.from);
  }

  if (input.to) {
    query.set('to', input.to);
  }

  const value = query.toString();

  return value ? `?${value}` : '';
}

export const reportingApi = {
  dashboard: (input: {
    from?: string;
    to?: string;
  }) =>
    apiRequest<ReportingDashboard>(
      `/reporting/dashboard${queryString(input)}`,
    ),

  exportUrl: (
    report: string,
    input: {
      from?: string;
      to?: string;
    },
  ) => {
    const query = new URLSearchParams({
      report,
    });

    if (input.from) {
      query.set('from', input.from);
    }

    if (input.to) {
      query.set('to', input.to);
    }

    const base =
      import.meta.env.VITE_API_URL ??
      'http://localhost:4000/api';

    return `${base}/reporting/export.csv?${query.toString()}`;
  },
};

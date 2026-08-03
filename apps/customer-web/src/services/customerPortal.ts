import { apiRequest } from '../lib/api';
import type {
  CustomerDashboard,
  CustomerJobDetail,
  Job,
} from '../types/customer';

export const customerPortalApi = {
  dashboard(
    customerId: string,
    customerUserId: string,
  ) {
    return apiRequest<CustomerDashboard>(
      `/customer-portal/customers/${customerId}/dashboard?customerUserId=${customerUserId}`,
    );
  },

  jobs(
    customerId: string,
    customerUserId: string,
  ) {
    return apiRequest<Job[]>(
      `/customer-portal/customers/${customerId}/jobs?customerUserId=${customerUserId}`,
    );
  },

  detail(
    customerId: string,
    customerUserId: string,
    jobId: string,
  ) {
    return apiRequest<CustomerJobDetail>(
      `/customer-portal/customers/${customerId}/jobs/${jobId}?customerUserId=${customerUserId}`,
    );
  },

  createJob(
    customerId: string,
    body: Record<string, unknown>,
  ) {
    return apiRequest<CustomerJobDetail>(
      `/customer-portal/customers/${customerId}/jobs`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );
  },

  action(
    customerId: string,
    jobId: string,
    action: string,
    body: Record<string, unknown>,
  ) {
    return apiRequest(
      `/customer-portal/customers/${customerId}/jobs/${jobId}/${action}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );
  },
};

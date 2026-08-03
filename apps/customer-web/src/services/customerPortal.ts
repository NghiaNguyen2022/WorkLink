import { apiRequest } from '../lib/api';
import type {
  CustomerDashboard,
  CustomerJobDetail,
  CustomerLocation,
  CustomerProfile,
  Job,
} from '../types/customer';

export const customerPortalApi = {
  dashboard(customerId: string) {
    return apiRequest<CustomerDashboard>(
      `/customer-portal/customers/${customerId}/dashboard`,
    );
  },

  jobs(customerId: string) {
    return apiRequest<Job[]>(
      `/customer-portal/customers/${customerId}/jobs`,
    );
  },

  detail(customerId: string, jobId: string) {
    return apiRequest<CustomerJobDetail>(
      `/customer-portal/customers/${customerId}/jobs/${jobId}`,
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

  profile(customerId: string) {
    return apiRequest<CustomerProfile>(
      `/customer-portal/customers/${customerId}/profile`,
    );
  },

  updateProfile(
    customerId: string,
    body: Record<string, unknown>,
  ) {
    return apiRequest<CustomerProfile>(
      `/customer-portal/customers/${customerId}/profile`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    );
  },

  locations(customerId: string) {
    return apiRequest<CustomerLocation[]>(
      `/customer-portal/customers/${customerId}/locations`,
    );
  },

  createLocation(
    customerId: string,
    body: Record<string, unknown>,
  ) {
    return apiRequest<CustomerLocation[]>(
      `/customer-portal/customers/${customerId}/locations`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );
  },

  updateLocation(
    customerId: string,
    locationId: string,
    body: Record<string, unknown>,
  ) {
    return apiRequest<CustomerLocation[]>(
      `/customer-portal/customers/${customerId}/locations/${locationId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    );
  },
};

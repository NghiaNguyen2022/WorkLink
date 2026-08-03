import { apiRequest } from '../lib/api';
import type { JobCategory } from '../types/customer';

export const catalogApi = {
  categories() {
    return apiRequest<JobCategory[]>('/job-categories');
  },
};

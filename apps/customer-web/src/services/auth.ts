import { apiRequest } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: string;
  mustChangePassword: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
  profileId: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  displayName: string;
}

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(input: RegisterInput) {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...input, role: 'CUSTOMER' }),
    });
  },
};

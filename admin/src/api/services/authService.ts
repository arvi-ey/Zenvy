import { apiClient } from '../axiosClient.ts';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
}

interface AuthResponse {
  user: AdminUser;
  accessToken: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AdminSignUpInput extends SignInInput {
  firstName: string;
  lastName: string;
  phone: string;
}

export const authService = {
  async getCurrentUser(): Promise<AdminUser> {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.user;
  },

  async signIn(input: SignInInput): Promise<AdminUser> {
    const response = await apiClient.post<AuthResponse>('/auth/admin/sign-in', input);
    return response.user;
  },

  async signUp(input: AdminSignUpInput): Promise<AdminUser> {
    const response = await apiClient.post<AuthResponse>('/auth/admin/sign-up', input);
    return response.user;
  },

  async signOut(): Promise<void> {
    await apiClient.post('/auth/sign-out');
  },
};

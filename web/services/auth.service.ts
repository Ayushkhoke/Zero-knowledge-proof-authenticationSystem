import { ApiClient } from '@/lib/api-client';
import {
  LoginResponse,
  ZkpRegisterRequest,
  ZkpLoginRequest,
  ZkpRegisterResponse,
  ZkpStatusResponse,
} from '@/types/auth.type';

export class AuthService {
  // ZKP Authentication Methods
  static async zkpRegister(data: ZkpRegisterRequest) {
    return await ApiClient.post<ZkpRegisterResponse>('/api/auth/zkp/register', data);
  }

  static async zkpLogin(data: ZkpLoginRequest) {
    return await ApiClient.post<LoginResponse>('/api/auth/zkp/login', data);
  }

  static async getZkpStatus(email: string) {
    return await ApiClient.get<ZkpStatusResponse>(`/api/auth/zkp/status?email=${encodeURIComponent(email)}`);
  }

  // Keep Google auth for later if needed
  static async handleGoogleAuth(idToken: string) {
    return await ApiClient.post<LoginResponse>('/api/auth/google', { idToken });
  }
}

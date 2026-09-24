export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  showPhoneNumber?: boolean;
  profilePhoto?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export type LoginResponse = AuthResponse;
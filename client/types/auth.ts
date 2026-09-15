export interface User {
  id: string;
  username: string;
  email: string;
  profilePhoto: string | null;
  createdAt?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
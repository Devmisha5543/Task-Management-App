export interface User {
  id: string;
  username: string;
  email: string;
  profilePhoto?: string | null;
  phoneNumber?: string;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

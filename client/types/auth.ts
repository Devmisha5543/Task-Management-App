export interface User {
  id: string;
  username: string;
  email: string;
  profilePhoto?: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
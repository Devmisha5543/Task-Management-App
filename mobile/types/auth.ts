export interface User {
  id: string;
  _id?: string;
  name?: string;
  username: string;
  email: string;
  profilePhoto?: string | null;
  phoneNumber?: string;
  showPhoneNumber?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

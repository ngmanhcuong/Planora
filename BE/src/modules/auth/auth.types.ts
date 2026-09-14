export interface SafeUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface AuthSuccessData {
  user: SafeUserResponse;
  accessToken: string;
}

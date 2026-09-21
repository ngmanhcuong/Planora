export interface SafeUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  accountTier: string;
  status: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface AuthSuccessData {
  user: SafeUserResponse;
  accessToken: string;
}

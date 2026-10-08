export interface SafeUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  accountTier: string;
  status: string;
  isVerified: boolean;
  createdAt: Date;
  avatarUrl?: string | null;
}

export interface AuthSuccessData {
  user: SafeUserResponse;
  accessToken: string;
}

export interface TwoFactorChallengeData {
  requiresTwoFactor: true;
  challengeId: string;
  emailHint: string;
}

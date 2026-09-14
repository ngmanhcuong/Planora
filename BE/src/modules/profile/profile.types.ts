export interface UserProfileResponse {
  userId: string;
  name: string;
  email: string;
  studentId: string | null;
  major: string | null;
  university: string | null;
  gpa: number;
  completedCredits: number;
  totalCredits: number;
  bio: string | null;
  avatarUrl: string | null;
}

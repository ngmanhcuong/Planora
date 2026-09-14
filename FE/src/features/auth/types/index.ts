import { z } from 'zod';
import { loginSchema, registerSchema } from '../validations/authSchemas';

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  token: string;
}

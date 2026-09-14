import { JwtPayload } from '../utils/jwt';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

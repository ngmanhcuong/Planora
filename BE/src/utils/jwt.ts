import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    return decoded;
  } catch (err) {
    return null;
  }
};

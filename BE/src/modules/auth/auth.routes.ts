import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  forgotPassword,
  getMe,
  logout,
} from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password/otp', requestPasswordResetOtp);
router.post('/forgot-password/verify', verifyPasswordResetOtp);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;



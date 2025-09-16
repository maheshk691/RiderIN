import express from 'express';
import {
  generatePhoneOTP,
  generateEmailOTP,
  verifyUserPhoneOTP,
  verifyDriverPhoneOTPLogin,
  verifyDriverPhoneOTPRegistration,
  verifyEmailOTP,
  getFakeOTP,
  fakeRegisterUser,
  fakeRegisterDriver
} from '../controllers/otp.controller';

const otpRouter = express.Router();

// Generate OTP endpoints
otpRouter.post('/generate/phone', generatePhoneOTP);
otpRouter.post('/generate/email', generateEmailOTP);

// Verify OTP endpoints
otpRouter.post('/verify/user/phone', verifyUserPhoneOTP);
otpRouter.post('/verify/driver/phone/login', verifyDriverPhoneOTPLogin);
otpRouter.post('/verify/driver/phone/registration', verifyDriverPhoneOTPRegistration);
otpRouter.post('/verify/email', verifyEmailOTP);

// Testing endpoint
otpRouter.get('/test/fake-otp', getFakeOTP);
otpRouter.post('/test/register-user', fakeRegisterUser);
otpRouter.post('/test/register-driver', fakeRegisterDriver);

export default otpRouter;

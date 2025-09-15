import speakeasy from 'speakeasy';
import { storeOTP } from './redis';
import nodemailer from 'nodemailer';

// Generate a numeric OTP
export const generateOTP = (length = 4): string => {
  // Use fake OTP for testing if enabled
  if (process.env.FAKE_OTP_ENABLED === 'true' && process.env.FAKE_OTP_VALUE) {
    console.log('🚀 FAKE OTP MODE: Using fake OTP value for testing');
    return process.env.FAKE_OTP_VALUE;
  }

  return speakeasy.totp({
    secret: speakeasy.generateSecret({ length: 20 }).base32,
    digits: length,
  });
};

// Generate and store OTP for a phone number
export const generateAndStoreOTP = async (phoneNumber: string): Promise<string> => {
  const otp = generateOTP(4);
  const key = `otp:phone:${phoneNumber}`;
  
  // Store in Redis with 5 minutes expiry
  await storeOTP(key, otp, 300);
  
  return otp;
};

// Generate and store OTP for an email
export const generateAndStoreEmailOTP = async (email: string): Promise<string> => {
  const otp = generateOTP(4);
  const key = `otp:email:${email}`;
  
  // Store in Redis with 5 minutes expiry
  await storeOTP(key, otp, 300);
  
  return otp;
};

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send OTP via email
export const sendOTPEmail = async (email: string, name: string, otp: string): Promise<boolean> => {
  try {
    // Log OTP for fake mode testing
    if (process.env.FAKE_OTP_ENABLED === 'true') {
      console.log(`📧 FAKE MODE: OTP ${otp} sent to ${email} (THIS IS FOR TESTING)`);
      console.log(`💡 FAKE OTP VALUE: ${otp} - Use this to verify email`);
    } else {
      console.log(`📧 Sending OTP ${otp} to ${email}`);
    }

    await transporter.sendMail({
      from: `"RiderIN" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your email address!',
      html: `
        <p>Hi ${name},</p>
        <p>Your RiderIN verification code is ${otp}. If you didn't request for this OTP, please ignore this email!</p>
<p>Thanks,<br>RiderIN Team</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send OTP via SMS (using Kannel or other SMS gateway)
export const sendOTPSMS = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // This is a placeholder for SMS sending logic
    // In a real implementation, you would integrate with Kannel or another SMS gateway

    // Log the OTP with special indicator for fake mode
    if (process.env.FAKE_OTP_ENABLED === 'true') {
      console.log(`📱 FAKE MODE: OTP ${otp} sent to ${phoneNumber} (THIS IS FOR TESTING)`);
      console.log(`💡 FAKE OTP VALUE: ${otp} - Use this in the app to login/verify`);
    } else {
      console.log(`📱 Sending OTP ${otp} to ${phoneNumber}`);
    }

    // For development, we'll just log the OTP and return success
    // In production, replace with actual SMS sending logic
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

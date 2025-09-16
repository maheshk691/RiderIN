import { Request, Response, NextFunction } from 'express';
import { generateOTP } from '../utils/otp';
import { generateAndStoreOTP, generateAndStoreEmailOTP, sendOTPEmail, sendOTPSMS } from '../utils/otp';
import { verifyOTP, deleteOTP } from '../utils/redis';
import prisma from '../utils/prisma';
import { sendToken } from '../utils/send-token';
import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
  lazyLoading: true,
});

// Generate OTP for phone number
export const generatePhoneOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone_number } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }
    
    // Generate and store OTP
    const otp = await generateAndStoreOTP(phone_number);
    
    // Send OTP via SMS
    const sent = await sendOTPSMS(phone_number, otp);
    
    if (sent) {
      return res.status(201).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to send OTP',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Generate OTP for email
export const generateEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, userId } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
    }
    
    // Generate and store OTP
    const otp = await generateAndStoreEmailOTP(email);
    
    // Send OTP via email
    const sent = await sendOTPEmail(email, name, otp);
    
    if (sent) {
      return res.status(201).json({
        success: true,
        message: 'OTP sent successfully',
        userId,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to send OTP',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify phone OTP for user
export const verifyUserPhoneOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone_number, otp } = req.body;
    
    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }
    
    // Verify OTP
    const key = `otp:phone:${phone_number}`;
    const isValid = await verifyOTP(key, otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }
    
    // Delete OTP after successful verification
    await deleteOTP(key);
    
    // Check if user exists
    const isUserExist = await prisma.user.findUnique({
      where: {
        phone_number,
      },
    });
    
    if (isUserExist) {
      // User exists, send token
      await sendToken(isUserExist, res);
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          phone_number,
        },
      });
      
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully!',
        user,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify phone OTP for driver login
export const verifyDriverPhoneOTPLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone_number, otp } = req.body;
    
    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }
    
    // Verify OTP
    const key = `otp:phone:${phone_number}`;
    const isValid = await verifyOTP(key, otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }
    
    // Delete OTP after successful verification
    await deleteOTP(key);
    
    // Find driver
    const driver = await prisma.driver.findUnique({
      where: {
        phone_number,
      },
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }
    
    // Send token
    sendToken(driver, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify phone OTP for driver registration
export const verifyDriverPhoneOTPRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone_number, otp } = req.body;
    
    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }
    
    // Verify OTP
    const key = `otp:phone:${phone_number}`;
    const isValid = await verifyOTP(key, otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }
    
    // Delete OTP after successful verification
    await deleteOTP(key);
    
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully!',
      phone_number,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Verify email OTP
export const verifyEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Verify OTP
    const key = `otp:email:${email}`;
    const isValid = await verifyOTP(key, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Delete OTP after successful verification
    await deleteOTP(key);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get fake OTP for testing purposes
export const getFakeOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.FAKE_OTP_ENABLED !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Fake OTP mode is not enabled',
      });
    }

    const fakeOTP = generateOTP(4);

    return res.status(200).json({
      success: true,
      message: 'Fake OTP retrieved successfully',
      fake_otp: fakeOTP,
      note: 'Use this OTP to test your application',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Fake register user for testing (bypasses OTP)
export const fakeRegisterUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.FAKE_OTP_ENABLED !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Fake OTP mode is not enabled',
      });
    }

    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Check if user exists
    const isUserExist = await prisma.user.findUnique({
      where: {
        phone_number,
      },
    });

    if (isUserExist) {
      // User exists, send token
      await sendToken(isUserExist, res);
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          phone_number,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Fake user registered successfully!',
        user,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Fake register driver for testing (bypasses OTP)
export const fakeRegisterDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.FAKE_OTP_ENABLED !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Fake OTP mode is not enabled',
      });
    }

    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Check if driver exists
    const isDriverExist = await prisma.driver.findUnique({
      where: {
        phone_number,
      },
    });

    if (isDriverExist) {
      // Driver exists, send token
      sendToken(isDriverExist, res);
    } else {
      // Create new driver
      const driver = await prisma.driver.create({
        data: {
          phone_number,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Fake driver registered successfully!',
        driver,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

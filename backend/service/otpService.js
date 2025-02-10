import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Temporary storage for OTPs (Replace with a database for production)
const otpStore = new Map();

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiration (5 minutes)
export const storeOTP = (email, otp) => {
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const data = otpStore.get(email);
  if (!data || data.expiresAt < Date.now() || data.otp !== otp) {
    return false;
  }
  otpStore.delete(email);
  return true;
};

// Send OTP via email
export const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};


export const sendPasswordSetupEmail = async (email, link) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Set Your Password',
      text: `Please set your password by clicking the following link: ${link}`,
    };
  
    await transporter.sendMail(mailOptions);
};
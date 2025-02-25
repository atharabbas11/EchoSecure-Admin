import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

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
    // text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
    html:`
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); text-align: center;">
        <!-- Logo Section -->
        <div style="margin-bottom: 20px;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Emblem_of_India.svg/200px-Emblem_of_India.svg.png" alt="Government Logo" width="80" style="display: block; margin: auto;">
        </div>
        <h2 style="color: #0056b3; margin-bottom: 10px;">EchoSeucre Chat</h2>
        <p style="font-size: 16px; color: #333;">Dear Admin,</p>
        <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for secure login is:</p>
        <!-- OTP Box -->
        <div style="margin: 20px 0;">
          <span style="display: inline-block; font-size: 24px; font-weight: bold; background: #f5f5f5; padding: 10px 20px; border-radius: 5px; border: 1px solid #ccc;">
            <code style="user-select: all;">${otp}</code>
          </span>
        </div>
        <p style="font-size: 16px; color: #333;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
        <p style="font-size: 14px; color: #777; text-align: center; border-top: 1px solid #ddd; padding-top: 10px;">
          If you didn't request this OTP, please ignore this email or contact support.
        </p>
      </div>
    `
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

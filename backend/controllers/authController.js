//controllers/authController.js
import Admin from '../models/adminModel.js';
import Session from '../models/sessionModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '../service/otpService.js';

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // Generate and send OTP
    const otp = generateOTP();
    storeOTP(email, otp);
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// const verifyOTPAndLogin = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     let clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     // Normalize localhost IP
//     if (clientIp === '::1' || clientIp === '127.0.0.1') {
//       clientIp = '127.0.0.1'; // Use IPv4 loopback for consistency
//     } else {
//       // Fetch public IP for non-localhost environments
//       const publicIpResponse = await axios.get('https://api.ipify.org?format=json');
//       clientIp = publicIpResponse.data.ip;
//     }

//     if (!verifyOTP(email, otp)) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(401).json({ message: "Invalid email or password" });

//     const sessionId = crypto.randomBytes(16).toString('hex');
//     const csrfToken = crypto.randomBytes(32).toString('hex');

//     const accessToken = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     const refreshToken = jwt.sign({ userId: admin._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

//     // Store session with IP address
//     await Session.create({ userId: admin._id, sessionId, csrfToken, ipAddress: clientIp });

//     res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
//     res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
//     res.cookie('sessionId', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });

//     res.status(200).json({ message: "Login successful", csrfToken });
//   } catch (error) {
//     console.error('OTP Verification Error:', error);
//     res.status(500).json({ message: 'Error verifying OTP' });
//   }
// };


const verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    let clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;

    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid email or password" });

    const sessionId = crypto.randomBytes(16).toString('hex');
    const csrfToken = crypto.randomBytes(32).toString('hex');

    const accessToken = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: admin._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store session with the correct IP address
    await Session.create({ userId: admin._id, sessionId, csrfToken, ipAddress: clientIp });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });

    res.status(200).json({ message: "Login successful", csrfToken });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};


const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'Admin registered successfully', newAdmin });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout Controller
const logoutAdmin = async (req, res) => {
  try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.clearCookie('sessionId');
      res.status(200).json({ message: "Logout successful" });
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    storeOTP(email, otp);
    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Verify OTP
const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

export { loginAdmin, verifyOTPAndLogin, registerAdmin, logoutAdmin, sendOTP, verifyOTPController };

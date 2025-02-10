import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendPasswordSetupEmail } from '../service/otpService.js';

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const users = await User.find().select("-password"); // Exclude password
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new user (admin only)
const createUser = async (req, res) => {
  const { fullName, email, profilePic, deleteOption } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    if (!fullName || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate a unique token for password setup
    const passwordSetupToken = crypto.randomBytes(32).toString('hex');
    const passwordSetupExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Generate a temporary hashed password
    const hashedPassword = await bcrypt.hash("temporaryPassword123", 10);

    const newUser = new User({
      fullName,
      email,
      profilePic,
      deleteAccount: deleteOption === "off" ? null : new Date(Date.now() + (deleteOption === "1 day" ? 1 : deleteOption === "7 days" ? 7 : 30) * 24 * 60 * 60 * 1000),
      password: hashedPassword,  // Provide a temporary password
      passwordSetupToken,
      passwordSetupExpires,
    });

    await newUser.save();

    // Send email with password setup link
    const passwordSetupLink = `http://localhost:5173/set-password?token=${passwordSetupToken}`;
    await sendPasswordSetupEmail(email, passwordSetupLink);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      deleteAccount: newUser.deleteAccount,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getAllUsers, createUser, deleteUser };
import mongoose from 'mongoose'; // Use import instead of require
import bcrypt from 'bcrypt';
import crypto from "crypto";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String },
    profilePic: { type: String, default: "" },
    deleteAccount: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    role: { type: String, default: "admin" }, // Add this field
    otp: { type: String, default: null }, // Encrypted OTP
    otpExpires: { type: Date, default: null }, // OTP expiration time
  },
  { timestamps: true }
);

// Ensure unique index for email
adminSchema.index({ email: 1 }, { unique: true });


// Method to encrypt OTP
adminSchema.methods.encryptOTP = async function (otp) {
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(otp, salt);
  this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  await this.save();
};

// Method to verify OTP
adminSchema.methods.verifyOTP = async function (otp) {
  return await bcrypt.compare(otp, this.otp);
}

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;

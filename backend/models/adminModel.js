import mongoose from 'mongoose'; // Use import instead of require

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
  },
  { timestamps: true }
);

// Ensure unique index for email
adminSchema.index({ email: 1 }, { unique: true });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
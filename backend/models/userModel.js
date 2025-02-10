import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    fullName: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Add role field
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Add status field
    lastLogin: { type: Date, default: null }, // Track last login
    disappearSettings: {
      type: Map,
      of: String, // 'off', '5min', '10min'
      default: {},
    },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    deleteAccount: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    passwordSetupToken: { type: String, default: null }, // Add password setup token
    passwordSetupExpires: { type: Date, default: null }, // Add password setup expiry
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
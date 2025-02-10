import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  csrfToken: { type: String, required: true },
  ipAddress: { type: String, required: true }, // Track IP address
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // Session expires in 24h
});

// Ensure the TTL index is created
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
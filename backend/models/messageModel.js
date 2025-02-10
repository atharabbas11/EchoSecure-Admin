import mongoose from 'mongoose'; // Use import instead of require

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: function () {
      return !this.groupId; // Only required if there is no groupId
    } },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Add this for groupId
    text: { type: String, },
    image: { type: String, },
    expiresAt: { type: Date, },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
import User from '../models/userModel.js';  // Correct ES module import
import Message from '../models/messageModel.js';

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Check if this returns a valid number
    const totalMessages = await Message.countDocuments();
    
    console.log("Total Users:", totalUsers); // Debugging log
    console.log("Total Messages:", totalMessages); // Debugging log

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('profilePic fullName email createdAt');

    console.log("Latest Users:", latestUsers); // Debugging log

    res.status(200).json({
      totalUsers,
      totalMessages,
      latestUsers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAdminStats };
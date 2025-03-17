import SessionUser from '../models/sessionUserModel.js';
import SessionAdmin from '../models/sessionModel.js';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';
import Message from '../models/messageModel.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Replace with your ipinfo.io token
const IPINFO_TOKEN =  process.env.IPINFO_TOKEN;

const getLocationFromIP = async (ip) => {
  try {
    // Fetch location data from ipinfo.io
    const response = await axios.get(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
    if (response.data) {
      const { city, region, country, loc, org, timezone, postal } = response.data;
      return {
        city,
        regionName: region,
        country,
        lat: loc ? loc.split(',')[0] : null, // Extract latitude from "loc"
        lon: loc ? loc.split(',')[1] : null, // Extract longitude from "loc"
        isp: org,
        org,
        timezone,
        postal,
      };
    } else {
      console.error('No data received from ipinfo.io');
      return null;
    }
  } catch (error) {
    console.error('Error fetching location from ipinfo.io:', error);
    return null;
  }
};

const getAdminStats = async (req, res) => {
  try {
    const { 
      newUsersTimeRange = '7d', 
      loggedInUsersTimeRange = '7d', 
      onemessagesTimeRange = '7d', 
      manymessagesTimeRange = '7d' 
    } = req.query;

    // Helper function to calculate start date based on time range
    const getStartDate = (timeRange) => {
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '1m':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7); // Default to last 7 days
      }
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    };

    const newUsersStartDate = getStartDate(newUsersTimeRange);
    const loggedInUsersStartDate = getStartDate(loggedInUsersTimeRange);
    const oneMessagesStartDate = getStartDate(onemessagesTimeRange);
    const manyMessagesStartDate = getStartDate(manymessagesTimeRange);

    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const activeUsersToday = await User.countDocuments({ updatedAt: { $gte: today } });

    // Get user growth (new users) over the selected time range
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: newUsersStartDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get login activity (users who logged in) over the selected time range
    const loginActivity = await User.aggregate([
      {
        $match: { updatedAt: { $gte: loggedInUsersStartDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get one-to-one messages over the selected time range
    const oneToOneMessages = await Message.aggregate([
      {
        $match: { createdAt: { $gte: oneMessagesStartDate }, groupId: { $exists: false } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get one-to-many messages over the selected time range
    const oneToManyMessages = await Message.aggregate([
      {
        $match: { createdAt: { $gte: manyMessagesStartDate }, groupId: { $exists: true } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('profilePic fullName email createdAt');

    // Fetch user session data with user details
    const userSessionData = await SessionUser.aggregate([
      {
        $lookup: {
          from: 'users', // Join with the User collection
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 0,
          sessionId: 1,
          ipAddress: 1,
          createdAt: 1,
          'userDetails.profilePic': 1,
          'userDetails.fullName': 1,
          type: { $literal: 'user' } // Add a type field to distinguish user sessions
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Fetch admin session data with admin details
    const adminSessionData = await SessionAdmin.aggregate([
      {
        $lookup: {
          from: 'admins', // Join with the Admin collection
          localField: 'userId',
          foreignField: '_id',
          as: 'adminDetails'
        }
      },
      {
        $unwind: '$adminDetails'
      },
      {
        $project: {
          _id: 0,
          sessionId: 1,
          ipAddress: 1,
          createdAt: 1,
          'adminDetails.profilePic': 1,
          'adminDetails.fullName': 1,
          type: { $literal: 'admin' } // Add a type field to distinguish admin sessions
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Combine user and admin session data
    const combinedSessionData = [...userSessionData, ...adminSessionData];

    // Add location data to combined session data
    const sessionDataWithLocation = await Promise.all(
      combinedSessionData.map(async (session) => {
        const location = await getLocationFromIP(session.ipAddress);
        return {
          ...session,
          userDetails: session.userDetails || { profilePic: '', fullName: 'Unknown User' },
          adminDetails: session.adminDetails || { profilePic: '', fullName: 'Unknown Admin' },
          location: location ? `${location.city}, ${location.regionName}, ${location.country}` : 'Unknown',
          coordinates: location ? [location.lat, location.lon] : null, // Latitude and longitude
          isp: location ? location.isp : 'Unknown',
          org: location ? location.org : 'Unknown',
          timezone: location ? location.timezone : 'Unknown',
        };
      })
    );

    res.status(200).json({
      totalUsers,
      totalMessages,
      newUsersToday,
      activeUsersToday,
      userGrowth,
      loginActivity,
      oneToOneMessages,
      oneToManyMessages,
      latestUsers,
      sessionData: sessionDataWithLocation, // Include combined session data with location
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getAdminStats };

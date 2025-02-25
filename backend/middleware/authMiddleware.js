// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import Session from '../models/sessionModel.js';

const authAdminMiddleware = async (req, res, next) => {
  try {
    let { accessToken, refreshToken } = req.cookies;
    const csrfToken = req.headers['x-csrf-token'];

    if (!accessToken || !csrfToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // Verify Access Token
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await Admin.findById(decoded.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const session = await Session.findOne({ userId: user._id, csrfToken });
      if (!session) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      req.user = user;
      next();
    } catch (error) {
      // If token is expired, try refreshing it
      if (error.name === 'TokenExpiredError' && refreshToken) {
        try {
          const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const newAccessToken = jwt.sign({ userId: decodedRefresh.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

          res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
          req.cookies.accessToken = newAccessToken; // Update request for this cycle
          
          req.user = await Admin.findById(decodedRefresh.userId);
          return next();
        } catch (refreshError) {
          return res.status(401).json({ message: 'Session expired, please log in again' });
        }
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export { authAdminMiddleware };

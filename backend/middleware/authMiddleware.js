// // backend/middleware/authMiddleware.js
// import jwt from 'jsonwebtoken';
// import Admin from '../models/adminModel.js';
// import Session from '../models/sessionModel.js';

// const authAdminMiddleware = async (req, res, next) => {
//   try {
//     const accessToken = req.cookies.accessToken;
//     const csrfToken = req.headers['x-csrf-token'];
//     let clientIp = (req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress).split(',')[0].trim(); // Get client IP and normalize

//     // Normalize localhost IP
//     if (clientIp === '::1' || clientIp === '127.0.0.1') {
//       clientIp = '127.0.0.1'; // Use IPv4 loopback for consistency
//     }

//     console.log('Client IP:', clientIp); // Debugging log

//     if (!accessToken || !csrfToken) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

//     // Check if token is expired
//     if (Date.now() >= decoded.exp * 1000) {
//       return res.status(401).json({ message: 'Token expired' });
//     }

//     const user = await Admin.findById(decoded.userId);
//     if (!user || user.role !== 'admin') {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     const session = await Session.findOne({ userId: user._id, csrfToken });
//     if (!session) {
//       return res.status(401).json({ message: 'Invalid session' });
//     }

//     // Normalize session IP address
//     const sessionIp = session.ipAddress.trim(); // Trim any extra spaces
//     console.log('Session IP:', sessionIp); // Debugging log

//     // Skip IP validation for localhost
//     if (clientIp === '127.0.0.1' && sessionIp === '127.0.0.1') {
//       console.log('Skipping IP validation for localhost');
//     } else if (sessionIp !== clientIp) {
//       console.log('IP Address Mismatch:', { sessionIp, clientIp }); // Debugging log
//       return res.status(401).json({ message: 'Session compromised' });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth Middleware Error:', error);
//     res.status(401).json({ message: 'Unauthorized' });
//   }
// };

// export { authAdminMiddleware };


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

          res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'None' });
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

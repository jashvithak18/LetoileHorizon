import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'l_etoile_horizon_lux_secret_key_987654321');
      
      // Resilient fallback logic: try Mongo lookup first
      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Mongoose lookup failed or connection down
      }

      if (user) {
        req.user = user;
      } else {
        // Database simulation fallback
        req.user = {
          _id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role || 'customer'
        };
      }
      
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Administrative privileges required' });
  }
};

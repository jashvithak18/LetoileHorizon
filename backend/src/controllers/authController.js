import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// In-memory simulation user database for local-first playability
const SIMULATED_USERS = [
  {
    _id: 'simulated_admin_id_007',
    name: 'Maitre Vance',
    email: 'admin@letoile.com',
    passwordHash: 'admin123', 
    role: 'admin'
  }
];

const generateToken = (id, name, email, role) => {
  return jwt.sign(
    { id, name, email, role },
    process.env.JWT_SECRET || 'l_etoile_horizon_lux_secret_key_987654321',
    { expiresIn: '30d' }
  );
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists in database
    let userExists = false;
    try {
      userExists = await User.findOne({ email });
    } catch (e) {
      userExists = SIMULATED_USERS.some(u => u.email === email);
    }

    if (userExists) {
      return res.status(400).json({ success: false, message: 'A profile with this email already exists.' });
    }

    let newUser = null;
    let token = '';

    try {
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'customer'
      });

      token = generateToken(user._id, user.name, user.email, user.role);
      newUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    } catch (dbError) {
      // Offline fallback
      const simulatedId = 'sim_' + Math.random().toString(36).substr(2, 9);
      const simulatedUser = {
        _id: simulatedId,
        name,
        email,
        role: role || 'customer'
      };
      
      SIMULATED_USERS.push({
        ...simulatedUser,
        passwordHash: password
      });

      token = generateToken(simulatedId, name, email, role || 'customer');
      newUser = simulatedUser;
    }

    res.status(201).json({
      success: true,
      data: {
        ...newUser,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    try {
      user = await User.findOne({ email });
    } catch (e) {
      // offline
    }

    if (user) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        return res.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.name, user.email, user.role)
          }
        });
      }
    } else {
      // Fallback check
      const simUser = SIMULATED_USERS.find(u => u.email === email);
      if (simUser) {
        if (password === simUser.passwordHash) {
          return res.json({
            success: true,
            data: {
              _id: simUser._id,
              name: simUser.name,
              email: simUser.email,
              role: simUser.role,
              token: generateToken(simUser._id, simUser.name, simUser.email, simUser.role)
            }
          });
        }
      } else if (email === 'admin@letoile.com' && password === 'admin123') {
        // Direct admin fallback bypass
        return res.json({
          success: true,
          data: {
            _id: 'simulated_admin_id_007',
            name: 'Maitre Vance',
            email: 'admin@letoile.com',
            role: 'admin',
            token: generateToken('simulated_admin_id_007', 'Maitre Vance', 'admin@letoile.com', 'admin')
          }
        });
      }
    }

    res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

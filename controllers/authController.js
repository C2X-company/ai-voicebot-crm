// server/controllers/authController.js
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const College = require('../models/College');

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email })
      .select('+password')
      .populate('college', 'name slug pineconeNamespace plan');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        college: user.college
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── GET CURRENT USER ───────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({
    user: {
      id:        req.user._id,
      name:      req.user.name,
      email:     req.user.email,
      role:      req.user.role,
      college:   req.user.college,
      lastLogin: req.user.lastLogin
    }
  });
};

// ── CREATE USER (superadmin only) ──────────────────────────────────────────
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, collegeId } = req.body;

    // Validate role
    if (!['superadmin', 'college_admin', 'agent'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // college_admin and agent must have a college
    if (role !== 'superadmin' && !collegeId) {
      return res.status(400).json({ message: 'College required for this role' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      college: collegeId || null
    });

    res.status(201).json({
      message: 'User created',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    });

  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── CHANGE PASSWORD ────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
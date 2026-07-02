const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// 1. Clerk verifies the token (is it real? is it expired?)
const requireAuth = ClerkExpressRequireAuth({});

// 2. We fetch the matching MongoDB user
const fetchMongoUser = async (req, res, next) => {
  try {
    // req.auth.userId is provided by ClerkExpressRequireAuth
    const clerkId = req.auth.userId;

    // Find the user in our database using their Clerk ID
    const user = await User.findOne({ clerkUserId: clerkId }).populate('college', 'name slug');

    if (!user) {
      return res.status(404).json({ error: 'User found in Clerk, but not in Database' });
    }

    // Attach the MongoDB user to the request just like we did before!
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// Export an array of middleware. Express will run them in order.
module.exports = [requireAuth, fetchMongoUser];
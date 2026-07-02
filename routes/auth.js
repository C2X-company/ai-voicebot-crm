// server/routes/auth.js
const express      = require('express');
const router       = express.Router();
const authCtrl     = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');

// Public
router.post('/login',  authCtrl.login);

// Protected
router.get('/me',           authenticate, authCtrl.getMe);
router.put('/change-password', authenticate, authCtrl.changePassword);

// Superadmin only
router.post('/users',
  authenticate,
  authorize('superadmin'),
  authCtrl.createUser
);

module.exports = router;
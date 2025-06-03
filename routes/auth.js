const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/send-otp', auth.sendOtp);
router.post('/verify-otp', auth.verifyOtp);
router.post('/login', auth.emailLogin);
router.post('/google', auth.googleLogin);

module.exports = router;
router.post('/signup', auth.signup);
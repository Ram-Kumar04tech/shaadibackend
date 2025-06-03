const User = require('../models/User');
const { generateOtp, verifyOtp } = require('../utils/otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: 'Mobile required' });
  try {
    await generateOtp(mobile);
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  if (!verifyOtp(mobile, otp)) return res.status(400).json({ error: 'Invalid or expired OTP' });
  let user = await User.findOne({ mobile });
  if (!user) user = await User.create({ mobile });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token, user });
};

exports.emailLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token, user });
};

exports.googleLogin = async (req, res) => {
  const { googleId, email, fullName } = req.body;
  let user = await User.findOne({ googleId });
  if (!user) user = await User.create({ googleId, email, fullName });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token, user });
};

exports.signup = async (req, res) => {
  const { fullName, email, password, dateOfBirth, gender } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ error: 'Email exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, password: hashed, dateOfBirth, gender });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ success: true, token, user });
};
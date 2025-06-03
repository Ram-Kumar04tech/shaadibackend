const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, dateOfBirth, gender } = req.body;

    if (!fullName || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      dateOfBirth,
      gender,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

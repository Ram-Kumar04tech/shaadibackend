const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    gender,
    // ... other fields from User model can be added here for registration
  } = req.body;

  try {
    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Password will be hashed by the pre-save hook in User model
      dateOfBirth,
      gender,
      // ... other fields
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      user.lastLogin = Date.now();
      await user.save();
      
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is set by the protect middleware
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update only the fields that are sent in the request body
      // For example: user.firstName = req.body.firstName || user.firstName;
      // This needs to be done for all updatable fields in the User model
      
      // General info
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
      user.gender = req.body.gender || user.gender;
      user.religion = req.body.religion || user.religion;
      user.caste = req.body.caste || user.caste;
      user.motherTongue = req.body.motherTongue || user.motherTongue;
      user.occupation = req.body.occupation || user.occupation;
      user.education = req.body.education || user.education;
      user.annualIncome = req.body.annualIncome || user.annualIncome;
      if (req.body.height) {
        user.height.value = req.body.height.value || user.height.value;
        user.height.unit = req.body.height.unit || user.height.unit;
      }
      user.maritalStatus = req.body.maritalStatus || user.maritalStatus;
      user.aboutMe = req.body.aboutMe || user.aboutMe;
      user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
      user.interests = req.body.interests || user.interests;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;
      user.country = req.body.country || user.country;
      user.showContactInfo = req.body.showContactInfo !== undefined ? req.body.showContactInfo : user.showContactInfo;
      
      // Partner Preferences update
      if (req.body.partnerPreferences) {
        user.partnerPreferences = {
          ...user.partnerPreferences,
          ...req.body.partnerPreferences,
        };
      }

      // If password is being updated
      if (req.body.password) {
        user.password = req.body.password; // The pre-save hook will hash it
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        // ...return other relevant fields, but not the password
        token: generateToken(updatedUser._id), // Optionally, re-issue token if needed
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// @desc    Get all users (for admin or matching - simplify for now)
// @route   GET /api/users
// @access  Private (could be admin only or based on subscription)
const getUsers = async (req, res) => {
  try {
    // Basic find, can be enhanced with pagination, filtering for matches etc.
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password'); // Exclude current user and passwords
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers
}; 
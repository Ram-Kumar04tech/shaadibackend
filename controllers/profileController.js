const Profile = require('../models/profile');

// @desc    Get user profile
// @route   GET /api/profiles/:userId
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// @desc    Create profile
// @route   POST /api/profiles
// @access  Private
exports.createProfile = async (req, res) => {
  try {
    const { fullName, age, dob, location, language, religion, community } = req.body;
    
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists for this user'
      });
    }

    const profile = new Profile({
      user: req.user.id,
      fullName,
      age,
      dob,
      location,
      language,
      religion,
      community
    });

    await profile.save();
    
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update profile
// @route   PUT /api/profiles/:userId
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, age, dob, location, language, religion, community } = req.body;
    
    // Check if profile exists
    let profile = await Profile.findOne({ user: req.params.userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update profile
    profile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { $set: { 
        fullName,
        age,
        dob,
        location,
        language,
        religion,
        community 
      }},
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete profile
// @route   DELETE /api/profiles/:userId
// @access  Private
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    await Profile.findOneAndRemove({ user: req.params.userId });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true, 
    lowercase: true 
  },
  mobileNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.email && !this.googleId; // Required only for email signup
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  dateOfBirth: { type: Date, required: true },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], 
    required: true 
  },

  // Additional Profile Information
  religion: { type: String, trim: true },
  caste: { type: String, trim: true },
  motherTongue: { type: String, trim: true },
  occupation: { type: String, trim: true },
  education: { type: String, trim: true },
  annualIncome: { type: String, trim: true },
  height: { 
    value: Number, 
    unit: { type: String, enum: ['cm', 'ft'] } 
  },
  maritalStatus: { 
    type: String, 
    enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'], 
    default: 'Never Married' 
  },
  aboutMe: { type: String, trim: true, maxlength: 1000 },

  // Partner Preferences
  partnerPreferences: {
    ageRange: { min: Number, max: Number },
    heightRange: { 
      min: Number, 
      max: Number, 
      unit: { type: String, enum: ['cm', 'ft'] } 
    },
    religion: [String],
    caste: [String],
    motherTongue: [String],
    education: [String],
    occupation: [String],
    maritalStatus: [String],
  },

  // Photos
  profilePhoto: { type: String },
  photos: [{ type: String }],

  // Location
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },

  // Account Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profileCompleted: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 0 },
  showContactInfo: { type: Boolean, default: false },
  compatibilityScore: { type: Number, default: 0 },

  // Timestamps
  registrationDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  return userObject;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User; 
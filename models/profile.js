const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  religion: {
    type: String,
    required: true
  },
  community: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);
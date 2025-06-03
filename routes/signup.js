const express = require('express');
const router = express.Router();
const signupController = require('../controllers/signupController');

router.post('/register', signupController.signup);

module.exports = router;

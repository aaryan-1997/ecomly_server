const express = require("express");
const app = express()
const authController = require('../controllers/auth');
const { body } = require('express-validator');
//const router = app.router();

const validateUser = [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').not().isEmpty().withMessage('Please enter a valid email address')
        .isEmail().withMessage("Please enter a valid email address"),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Please enter a valid password')
        .isStrongPassword()
        .withMessage('Password must contain at least one uppercase, one lowercase, and one symbol.'),
    body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
];

app.post('/register', validateUser, authController.register);

app.post('/login', authController.login);

app.post('/forgot-password', authController.forgotPassword);

app.post('/verify-otp', authController.verifyPasswordResetOtp);

app.post('/reset-password', authController.resetPassword);

module.exports = app;

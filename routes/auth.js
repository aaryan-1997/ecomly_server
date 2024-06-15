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
        .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol.'),
    body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
];
const validatePassword = [
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Please enter a valid password')
        .isStrongPassword()
        .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol.'),
];

app.post('/register', validateUser, authController.register);

app.post('/login', authController.login);

app.get('/verify-token', authController.verifyToken);

app.post('/forgot-password', authController.forgotPassword);

app.post('/verify-otp', authController.verifyPasswordResetOtp);

app.post('/reset-password', validatePassword, authController.resetPassword);

module.exports = app;

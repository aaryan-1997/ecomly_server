const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { Token } = require('../models/token');

exports.register = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const errorMessages = errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return res.status(400).json({ errors: errorMessages });
    }
    try {
        let user = new User({
            ...req.body,
            passwordHash: bcrypt.hashSync(req.body.password, 8)
        });
        user = await user.save();
        if (!user) {
            return res.status(500).json({
                type: "Internal Server Error",
                message: "Could not create user",
            });
        } else {
            return res.status(200).json(user)
        }
        console.info(user);
    } catch (error) {
        if (error.message.includes('email_1 dup key')) {
            return res.status(409).json({
                type: "Auth Error",
                message: "User with this email already exists.",
            });
        }
        return res.status(500).json({ type: error.name, message: error.message });
    }

}

exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(500).json({ message: 'User not found\nCheck your email and try again.' });
        }
        if (!bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(500).json({ message: "Incorrect password." });
        }
        // access token
        const accessToken = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' },
        );
        // refresh token
        const refreshToken = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '60d' },
        );
        const token = await Token.findOne({ userId: user.id });
        if (token) await token.deleteOne();
        await new Token({
            userId: user.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
        }).save();
        user.passwordHash = undefined;
        return res.status(200).json({ ...user._doc, accessToken });
    } catch (error) {
        console.info(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.forgotPassword = async function (req, res) { }

exports.verifyPasswordResetOtp = async function (req, res) { }

exports.resetPassword = async function (req, res) { }
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { Token } = require('../models/token');
const mailSender = require('../helper/email_sender');

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
    } catch (error) {
        console.error(error);
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
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.verifyToken = async function (req, res) {
    try {
        let accessToken = req.headers.authorization;
        if (!accessToken) return res.json(false);
        accessToken = accessToken.replace("Bearer", '').trim();

        const token = await Token.findOne({ accessToken });
        if (!token) return res.json(false);

        const tokenData = jwt.decode(token.refreshToken);
        const user = await User.findById(tokenData.id);
        if (!user) return res.json(false);

        const isValid = jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!isValidisValid) return res.json(false);

        return res.json(true);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.forgotPassword = async function (req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404)
                .json({ message: "User with that email does NOT exist!" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000);
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = Date.now() + 600000;// 10 min
        await user.save();

        const response = await mailSender.sendMail(
            email,
            "Rest Password OTP",
            `Your OTP for password rest is : ${otp}`
        );
        return res.status(200).json({ message: "Password reset OTP sent to your email" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.verifyPasswordResetOtp = async function (req, res) {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        if (user.resetPasswordOtp !== +otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }
        if (Date.now() > user.resetPasswordOtpExpires) {
            return res.status(401).json({ message: "OTP is expired!" });
        }

        user.resetPasswordOtp = 1;
        user.resetPasswordOtpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "OTP verified successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.resetPassword = async function (req, res) {
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
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        if (user.resetPasswordOtp !== 1) {
            return res.status(401).json({ message: "Confirm OTP before reseting password." });
        }

        user.passwordHash = bcrypt.hashSync(newPassword, 8);
        user.resetPasswordOtp = undefined;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}
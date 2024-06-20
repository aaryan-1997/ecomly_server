const jwt = require('jsonwebtoken');
const { Token } = require("../models/token");
const { User } = require("../models/user");

async function errorHandler(error, req, res, next) {
    if (error.name === 'UnauthorizedError') {
        if (!error.message.includes('jwt expired')) {
            return res
                .status()
                .json({ message: error.message, type: error.name }
                );
        }
        try {
            const authHeader = req.header("Authorization");
            const accessToken = authHeader.replace('Bearer', '').trim();
            const token = await Token.findOne({
                accessToken,
                refreshToken: { $exists: true },
            });

            if (!token) {
                return res
                    .status(401)
                    .json({ type: 'Unauthorized', message: "Token does not exist" });
            }

            const userData = jwt.verify(token.refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findById(userData.id);
            if (!user) {
                return res.status(404).json({ message: "Invalid user!" });
            }

            const newAccessToken = jwt.sign(
                { id: user.id, isAdmin: user.isAdmin },
                process.env.ACCESS_TOKEN_SECRET,
                { expireIn: '24h' },
            );

            req.headers['authorization'] = `Bearer ${newAccessToken}`;

            // token.accessToken = newAccessToken;
            // await Token.save();

            await Token.updateOne(
                { _id: token.id },
                { accessToken: newAccessToken },
            ).exec();

            res.set('Authorization', `Bearer ${newAccessToken}`);

            return next();

        } catch (refreshError) {
            console.error(refreshError);
            return res.status(401).json({ type: 'Unauthorized', message: refreshError.message });
        }
    }
}

module.exports = errorHandler;
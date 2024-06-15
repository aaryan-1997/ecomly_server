const nodemailer = require('nodemailer');

exports.sendMail = async (email, subject, body) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            // 
            host: "sandbox.smtp.mailtrap.io",
            port: 587,
            service: false,
            auth: {
                user: process.env.USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: body,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("error sending mail :", error);
                reject({ message: "Error sending mail" });
            }
            console.log("Mail sent :", info);
            resolve({ message: "Password reset OTP sent to your email" });
        });
    });
}
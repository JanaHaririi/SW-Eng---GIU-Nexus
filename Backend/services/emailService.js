// services/emailService.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

    try {

        const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port,
            secure: port === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: options.email,
            subject: options.subject,
            text: options.text || options.message,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.response);

    } catch (error) {

        console.error(
            'Email sending failed:',
            error.code || '',
            error.responseCode || '',
            error.message
        );

        throw new Error(`Email could not be sent: ${error.code || error.message}`);

    }

};

module.exports = sendEmail;

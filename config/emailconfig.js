const dotenv = require('dotenv');
const nodemailer = require("nodemailer");

dotenv.config()


var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, //true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, //Admin Gmail ID
        pass: process.env.EMAIL_PASS, //Admin Gmail password
    }
})

module.exports = transporter
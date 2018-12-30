
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'luepbphdowqhr4l7@ethereal.email',
        pass: 'ghhdrYdRg7Kqs6hhF5'
    }
});


export function sendValidateEmail(user, token) {
	console.log('validate email', user.email, token)
};


export function sendResetPassword(user, token) {
	console.log('reset password', user.email, token)
};


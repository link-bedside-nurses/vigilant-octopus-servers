import { env } from 'node:process';
import nodemailer from 'nodemailer';
import logger from '../../../core/utils/logger';

const bcc = '';
const cc = '';
const attachments: never[] = [];

export const sendMail = async (to: string, html: string, subject: string, text: string) => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: env.SENDER_EMAIL,
			pass: env.APP_PASSWORD,
		},
	});

	const info = await transporter.sendMail({
		from: `"FROM LINKBEDSIDE NURSES" <${process.env.SENDER_EMAIL}>`,
		to,
		subject,
		text,
		html,
		bcc,
		cc,
		attachments,
	});

	logger.info('Message sent: %s', info.messageId);
	logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

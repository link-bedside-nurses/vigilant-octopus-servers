import * as envalid from 'envalid';

const env = envalid.cleanEnv(process.env, {
	// Process
	NODE_ENV: envalid.str({ choices: ['development', 'production'] }),
	PORT: envalid.num(),
	HOST: envalid.str(),

	// Database
	DATABASE_URL: envalid.str(),
	DATABASE_NAME: envalid.str(),
	SEED_DATABASE: envalid.bool(),

	// App Auth
	ACCESS_TOKEN_SECRET: envalid.str(),

	// Email
	APP_PASSWORD: envalid.str(),
	SENDER_EMAIL: envalid.str(),
	RECIPIENT_EMAIL: envalid.str(),

	// SMS Sender (optional, used for phone normalization)
	FROM_SMS_PHONE: envalid.str({ default: '' }),

	// OTP expiry configuration (seconds)
	OTP_EXPIRY_SECONDS: envalid.num({ default: 300 }),

	// EgoSMS Provider
	SMS_USERNAME: envalid.str(),
	SMS_PASSWORD: envalid.str(),
	SMS_SENDER_ID: envalid.str(),

	// REDIS
	REDIS_HOST: envalid.str(),
	REDIS_PORT: envalid.str(),
	REDIS_PASSWORD: envalid.str(),

	// MarzPay Payment Gateway
	MARZ_PAY_BASE_URL: envalid.str({ default: 'https://wallet.wearemarz.com/api/v1' }),
	MARZ_PAY_API_KEY: envalid.str(),
	MARZ_PAY_API_SECRET: envalid.str(),
	APP_URL: envalid.str(),
});

const envars = Object.freeze({
	NODE_ENV: env.NODE_ENV,
	PORT: env.PORT,
	HOST: env.HOST,
	DATABASE_URL: env.DATABASE_URL,
	DATABASE_NAME: env.DATABASE_NAME,
	SEED_DATABASE: env.SEED_DATABASE,
	ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
	APP_PASSWORD: env.APP_PASSWORD,
	SENDER_EMAIL: env.SENDER_EMAIL,
	RECIPIENT_EMAIL: env.RECIPIENT_EMAIL,
	FROM_SMS_PHONE: env.FROM_SMS_PHONE,
	OTP_EXPIRY_SECONDS: env.OTP_EXPIRY_SECONDS,
	SMS_USERNAME: env.SMS_USERNAME,
	SMS_PASSWORD: env.SMS_PASSWORD,
	SMS_SENDER_ID: env.SMS_SENDER_ID,
	MARZ_PAY_BASE_URL: env.MARZ_PAY_BASE_URL,
	MARZ_PAY_API_KEY: env.MARZ_PAY_API_KEY,
	MARZ_PAY_API_SECRET: env.MARZ_PAY_API_SECRET,
	APP_URL: env.APP_URL,
});

export default envars;

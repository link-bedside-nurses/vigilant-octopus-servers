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

	// MOMO
	MOMO_CALLBACK_HOST: envalid.str(),
	X_REFERENCE_ID: envalid.str(),
	API_KEY: envalid.str(),
	OCP_APIM_SUBSCRIPTION_KEY: envalid.str(),

	// Airtel
	AIRTEL_MONEY_CLIENT_ID: envalid.str(),
	AIRTEL_MONEY_CLIENT_SECRET_KEY: envalid.str(),
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
	MOMO_CALLBACK_HOST: env.MOMO_CALLBACK_HOST,
	X_REFERENCE_ID: env.X_REFERENCE_ID,
	API_KEY: env.API_KEY,
	OCP_APIM_SUBSCRIPTION_KEY: env.OCP_APIM_SUBSCRIPTION_KEY,
	AIRTEL_MONEY_CLIENT_ID: env.AIRTEL_MONEY_CLIENT_ID,
	AIRTEL_MONEY_CLIENT_SECRET_KEY: env.AIRTEL_MONEY_CLIENT_SECRET_KEY,
});

export default envars;

import * as envalid from 'envalid';

const env = envalid.cleanEnv(process.env, {
	// Process
	NODE_ENV: envalid.str({ choices: ['development', 'production'] }),
	PORT: envalid.num(),

	// Database
	DATABASE_URL: envalid.str(),
	DATABASE_NAME: envalid.str(),

	// App Auth
	ACCESS_TOKEN_SECRET: envalid.str(),

	// Email
	APP_PASSWORD: envalid.str(),
	SENDER_EMAIL: envalid.str(),
	RECIPIENT_EMAIL: envalid.str(),

	// OTP/SMS
	FROM_SMS_PHONE: envalid.str(),
	TO_SMS_PHONE: envalid.str(),
	INFOBIP_API_BASE_URL: envalid.str(),
	INFOBIP_API_KEY: envalid.str(),

	// REDIS
	REDIS_HOST: envalid.str(),
	REDIS_PORT: envalid.str(),
	REDIS_PASSWORD: envalid.str(),

	// MOMO
	X_REFERENCE_ID: envalid.str(),
	API_KEY: envalid.str(),
	OCP_APIM_SUBSCRIPTION_KEY: envalid.str(),

	// Airtel
	AIRTEL_MONEY_CLIENT_ID: envalid.str(),
	AIRTEL_MONEY_CLIENT_SECRET_KEY: envalid.str(),

	// Cloudinary
	CLOUDINARY_CLOUD_NAME: envalid.str(),
	CLOUDINARY_API_KEY: envalid.str(),
	CLOUDINARY_API_SECRET: envalid.str(),
});

const envars = Object.freeze({
	NODE_ENV: env.NODE_ENV,
	PORT: env.PORT,
	DATABASE_URL: env.DATABASE_URL,
	DATABASE_NAME: env.DATABASE_NAME,
	ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
	APP_PASSWORD: env.APP_PASSWORD,
	SENDER_EMAIL: env.SENDER_EMAIL,
	RECIPIENT_EMAIL: env.RECIPIENT_EMAIL,
	FROM_SMS_PHONE: env.FROM_SMS_PHONE,
	TO_SMS_PHONE: env.TO_SMS_PHONE,
	INFOBIP_API_BASE_URL: env.INFOBIP_API_BASE_URL,
	INFOBIP_API_KEY: env.INFOBIP_API_KEY,
	X_REFERENCE_ID: env.X_REFERENCE_ID,
	API_KEY: env.API_KEY,
	OCP_APIM_SUBSCRIPTION_KEY: env.OCP_APIM_SUBSCRIPTION_KEY,
	AIRTEL_MONEY_CLIENT_ID: env.AIRTEL_MONEY_CLIENT_ID,
	AIRTEL_MONEY_CLIENT_SECRET_KEY: env.AIRTEL_MONEY_CLIENT_SECRET_KEY,
	CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET,
});

export default envars;

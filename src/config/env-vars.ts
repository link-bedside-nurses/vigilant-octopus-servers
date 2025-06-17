import * as envalid from 'envalid';

const env = envalid.cleanEnv(process.env, {
	NODE_ENV: envalid.str({
		choices: ['development', 'production'],
	}),
	PORT: envalid.num(),
	DATABASE_URL: envalid.str(),
	DATABASE_NAME: envalid.str(),

	ACCESS_TOKEN_SECRET: envalid.str(),
	REFRESH_TOKEN_SECRET: envalid.str(),
	ACCESS_TOKEN_EXPIRATION: envalid.str(),
	REFRESH_TOKEN_EXPIRATION: envalid.str(),

	FROM_SMS_PHONE: envalid.str(),
	TO_SMS_PHONE: envalid.str(),
	INFOBIP_URL: envalid.str(),
	INFOBIP_SECRET_KEY: envalid.str(),
	TWILIO_ACCOUNT_SID: envalid.str(),
	TWILIO_AUTH_TOKEN: envalid.str(),

	X_REFERENCE_ID: envalid.str(),
	API_KEY: envalid.str(),
	OCP_APIM_SUBSCRIPTION_KEY: envalid.str(),

	AIRTEL_MONEY_CLIENT_ID: envalid.str(),
	AIRTEL_MONEY_CLIENT_SECRET_KEY: envalid.str(),
});

export default Object.freeze({
	NODE_ENV: env.NODE_ENV,
	PORT: Number(env.PORT),
	DATABASE_URL: String(env.DATABASE_URL),
	DATABASE_NAME: String(env.DATABASE_NAME),
	ACCESS_TOKEN_SECRET: String(env.ACCESS_TOKEN_SECRET),
	REFRESH_TOKEN_SECRET: String(env.REFRESH_TOKEN_SECRET),
	ACCESS_TOKEN_EXPIRATION: String(env.ACCESS_TOKEN_EXPIRATION),
	REFRESH_TOKEN_EXPIRATION: String(env.REFRESH_TOKEN_EXPIRATION),
	FROM_SMS_PHONE: String(env.FROM_SMS_PHONE),
	TO_SMS_PHONE: String(env.TO_SMS_PHONE),
	INFOBIP_SECRET_KEY: String(env.INFOBIP_SECRET_KEY),
	INFOBIP_URL: String(env.INFOBIP_URL),
	TWILIO_ACCOUNT_SID: String(env.TWILIO_ACCOUNT_SID),
	TWILIO_AUTH_TOKEN: String(env.TWILIO_AUTH_TOKEN),
	X_REFERENCE_ID: String(env.X_REFERENCE_ID),
	API_KEY: String(env.API_KEY),
	OCP_APIM_SUBSCRIPTION_KEY: String(env.OCP_APIM_SUBSCRIPTION_KEY),
	AIRTEL_MONEY_CLIENT_ID: String(env.AIRTEL_MONEY_CLIENT_ID),
	AIRTEL_MONEY_CLIENT_SECRET_KEY: String(env.AIRTEL_MONEY_CLIENT_SECRET_KEY),
});

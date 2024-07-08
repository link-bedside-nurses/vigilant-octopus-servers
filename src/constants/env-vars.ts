import * as envalid from 'envalid';
import { __PROD__ } from './prod';

const env = envalid.cleanEnv(process.env, {
	NODE_ENV: envalid.str({
		choices: ['development', 'production'],
	}),
	PORT: envalid.num(),
	DATABASE_URL_PROD: envalid.str(),
	DATABASE_URL_DEV: envalid.str(),
	DATABASE_NAME_PROD: envalid.str(),
	DATABASE_NAME_DEV: envalid.str(),

	ACCESS_TOKEN_SECRET: envalid.str(),
	REFRESH_TOKEN_SECRET: envalid.str(),
	ACCESS_TOKEN_EXPIRATION: envalid.str(),
	REFRESH_TOKEN_EXPIRATION: envalid.str(),

	APP_EMAIL_SERVICE_USERNAME: envalid.str(),
	APP_EMAIL_SERVICE_PASSWORD: envalid.str(),

	VERIFICATION_CODE_LENGTH: envalid.num(),

	REDIS_URL: envalid.str(),
	REDISCLI_AUTH: envalid.str(),

	FROM_SMS_PHONE: envalid.str(),
	TO_SMS_PHONE: envalid.str(),
	TWILIO_ACCOUNT_SID: envalid.str(),
	TWILIO_AUTH_TOKEN: envalid.str(),

	X_REFERENCE_ID: envalid.str(),
	API_KEY: envalid.str(),
	OCP_APIM_SUBSCRIPTION_KEY: envalid.str(),

	AIRTEL_MONEY_CLIENT_ID: envalid.str(),
	AIRTEL_MONEY_CLIENT_SECRET_KEY: envalid.str(),
});

export default Object.freeze({
	getNodeEnv: () => env.NODE_ENV,
	getPort: () => Number(env.PORT),
	getDatabaseUrl: () => String(__PROD__ ? env.DATABASE_URL_PROD : env.DATABASE_URL_DEV),
	getDatabaseName: () => String(__PROD__ ? env.DATABASE_NAME_PROD : env.DATABASE_NAME_DEV),

	getAccessTokenSecret: () => String(env.ACCESS_TOKEN_SECRET),
	getRefreshTokenSecret: () => String(env.REFRESH_TOKEN_SECRET),
	getAccessTokenExpiration: () => String(env.ACCESS_TOKEN_EXPIRATION),
	getRefreshTokenExpiration: () => String(env.REFRESH_TOKEN_EXPIRATION),

	getEmailServiceUsername: () => String(env.APP_EMAIL_SERVICE_USERNAME),
	getEmailServicePassword: () => String(env.APP_EMAIL_SERVICE_PASSWORD),

	getVerificationCodeLength: () => Number(env.VERIFICATION_CODE_LENGTH),

	getCacheStoreURL: () => String(env.REDIS_URL),
	getCacheStoreCLIAuth: () => String(env.REDISCLI_AUTH),

	getFromSMSPhone: () => String(env.FROM_SMS_PHONE),
	getTO_SMS_Phone: () => String(env.TO_SMS_PHONE),
	getTwilioAccountSID: () => String(env.TWILIO_ACCOUNT_SID),
	getTwilioAuthToken: () => String(env.TWILIO_AUTH_TOKEN),

	getXReferenceId: () => String(env.X_REFERENCE_ID),
	getApiKey: () => String(env.API_KEY),
	getOcpApimSubscriptionKey: () => String(env.OCP_APIM_SUBSCRIPTION_KEY),

	getAirtelMoneyClientId: () => String(env.AIRTEL_MONEY_CLIENT_ID),
	getAirtelMoneyClientSecretKey: () => String(env.AIRTEL_MONEY_CLIENT_SECRET_KEY),
});

import * as envalid from "envalid";

const env = envalid.cleanEnv(process.env, {
  NODE_ENV: envalid.str({ choices: ["development", "production"], default: "development" }),
  PORT: envalid.num({ default: 3000 }),
  DATABASE_URL: envalid.str(),
  DATABASE_NAME: envalid.str(),
  ACCESS_TOKEN_SECRET: envalid.str(),
  REFRESH_TOKEN_SECRET: envalid.str(),
  ACCESS_TOKEN_EXPIRATION: envalid.str(),
  REFRESH_TOKEN_EXPIRATION: envalid.str(),
  APP_EMAIL_SERVICE_USERNAME: envalid.str(),
  APP_EMAIL_SERVICE_PASSWORD: envalid.str(),
  VERIFICATION_CODE_LENGTH: envalid.num(),
});

export default Object.freeze({
  getNodeEnv: () => env.NODE_ENV,
  getPort: () => Number(env.PORT),
  getDatabaseUrl: () => String(env.DATABASE_URL),
  getDatabaseName: () => String(env.DATABASE_NAME),

  getAccessTokenSecret: () => String(env.ACCESS_TOKEN_SECRET),
  getRefreshTokenSecret: () => String(env.REFRESH_TOKEN_SECRET),
  getAccessTokenExpiration: () => String(env.ACCESS_TOKEN_EXPIRATION),
  getRefreshTokenExpiration: () => String(env.REFRESH_TOKEN_EXPIRATION),

  getEmailServiceUsername: () => String(env.APP_EMAIL_SERVICE_USERNAME),
  getEmailServicePassword: () => String(env.APP_EMAIL_SERVICE_PASSWORD),

  getVerificationCodeLength: () => Number(env.VERIFICATION_CODE_LENGTH),
});

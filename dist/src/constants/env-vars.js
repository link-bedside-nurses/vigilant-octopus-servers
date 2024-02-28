"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var envalid = __importStar(require("envalid"));
var env = envalid.cleanEnv(process.env, {
    NODE_ENV: envalid.str({
        choices: ["development", "production"],
    }),
    PORT: envalid.num(),
    DATABASE_URL: envalid.str(),
    DATABASE_NAME: envalid.str(),
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
    AWS_ACCESS_KEY_ID: envalid.str(),
    AWS_SECRET_KEY_ID: envalid.str(),
    GOOGLE_MAPS_API_KEY: envalid.str(),
});
exports.default = Object.freeze({
    getNodeEnv: function () { return env.NODE_ENV; },
    getPort: function () { return Number(env.PORT); },
    getDatabaseUrl: function () { return String(env.DATABASE_URL); },
    getDatabaseName: function () { return String(env.DATABASE_NAME); },
    getAccessTokenSecret: function () { return String(env.ACCESS_TOKEN_SECRET); },
    getRefreshTokenSecret: function () { return String(env.REFRESH_TOKEN_SECRET); },
    getAccessTokenExpiration: function () { return String(env.ACCESS_TOKEN_EXPIRATION); },
    getRefreshTokenExpiration: function () { return String(env.REFRESH_TOKEN_EXPIRATION); },
    getEmailServiceUsername: function () { return String(env.APP_EMAIL_SERVICE_USERNAME); },
    getEmailServicePassword: function () { return String(env.APP_EMAIL_SERVICE_PASSWORD); },
    getVerificationCodeLength: function () { return Number(env.VERIFICATION_CODE_LENGTH); },
    getCacheStoreURL: function () { return String(env.REDIS_URL); },
    getCacheStoreCLIAuth: function () { return String(env.REDISCLI_AUTH); },
    getFromSMSPhone: function () { return String(env.FROM_SMS_PHONE); },
    getTO_SMS_Phone: function () { return String(env.TO_SMS_PHONE); },
    getTwilioAccountSID: function () { return String(env.TWILIO_ACCOUNT_SID); },
    getTwilioAuthToken: function () { return String(env.TWILIO_AUTH_TOKEN); },
    getXReferenceId: function () { return String(env.X_REFERENCE_ID); },
    getApiKey: function () { return String(env.API_KEY); },
    getOcpApimSubscriptionKey: function () { return String(env.OCP_APIM_SUBSCRIPTION_KEY); },
    getAirtelMoneyClientId: function () { return String(env.AIRTEL_MONEY_CLIENT_ID); },
    getAirtelMoneyClientSecretKey: function () { return String(env.AIRTEL_MONEY_CLIENT_SECRET_KEY); },
    getAwsAccessKeyId: function () { return String(env.AWS_ACCESS_KEY_ID); },
    getAwsSecretKeyId: function () { return String(env.AWS_SECRET_KEY_ID); },
    getGoogleMapsApiKey: function () { return String(env.GOOGLE_MAPS_API_KEY); },
});
//# sourceMappingURL=env-vars.js.map
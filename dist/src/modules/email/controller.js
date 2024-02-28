"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.sendEmail = void 0;
var http_status_codes_1 = require("http-status-codes");
var db_1 = require("../../db");
var token_1 = require("../../services/token/token");
var send_otp_1 = require("../../services/otp/send-otp");
var node_cron_1 = __importDefault(require("node-cron"));
var client_1 = require("../../cache-store/client");
var email_1 = require("../../services/email/email");
var html_1 = require("../../constants/html");
function sendEmail() {
    function expireOTPCache(email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    client_1.otpCacheStore.expire(email);
                }
                catch (error) {
                    console.error('Error expiring OTP from cache:', error);
                }
                return [2 /*return*/];
            });
        });
    }
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var otp, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        otp = (0, send_otp_1.generateOTP)();
                        return [4 /*yield*/, (0, send_otp_1.storeOTP)(request.query.email, otp.toString())];
                    case 1:
                        _a.sent();
                        node_cron_1.default.schedule('*/2 * * * *', function () {
                            expireOTPCache(request.query.email);
                        });
                        return [4 /*yield*/, (0, email_1.sendMail)(request.query.email, (0, html_1.html)(otp.toString()), "Email Verification", otp.toString())];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: null,
                                    message: 'Email sent successfully!',
                                },
                            }];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                                body: {
                                    data: error_1,
                                    message: 'Failed to send email',
                                },
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
}
exports.sendEmail = sendEmail;
function verifyEmail() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, otp, cacheStoreOTP, admin, accessToken, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.body, email = _a.email, otp = _a.otp;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, (0, send_otp_1.getOTPFromCacheStore)(email)];
                    case 2:
                        cacheStoreOTP = _b.sent();
                        if (!cacheStoreOTP) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        data: null,
                                        message: 'Wrong or Expired OTP. Try resending the OTP request',
                                    },
                                }];
                        }
                        if (!(cacheStoreOTP === otp)) return [3 /*break*/, 5];
                        admin = void 0;
                        return [4 /*yield*/, db_1.db.admins.findOne({ email: email })];
                    case 3:
                        admin = _b.sent();
                        if (!admin) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        data: null,
                                        message: 'No such user with given email. Please try registering again after 5 mins',
                                    },
                                }];
                        }
                        admin.isEmailVerified = true;
                        return [4 /*yield*/, admin.save()];
                    case 4:
                        admin = _b.sent();
                        accessToken = (0, token_1.createAccessToken)(admin);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: admin,
                                    accessToken: accessToken,
                                    message: 'OTP has been Verified',
                                },
                            }];
                    case 5: return [2 /*return*/, {
                            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                            body: {
                                data: null,
                                message: 'Wrong OTP',
                            },
                        }];
                    case 6:
                        error_2 = _b.sent();
                        console.log("error: ", error_2);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                                body: {
                                    data: null,
                                    message: 'FAILED TO VERIFY OTP',
                                },
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
}
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=controller.js.map
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
exports.verifyOTP = exports.getOTP = void 0;
var http_status_codes_1 = require("http-status-codes");
var designations_1 = require("../../interfaces/designations");
var db_1 = require("../../db");
var token_1 = require("../../services/token/token");
var send_otp_1 = __importStar(require("../../services/otp/send-otp"));
var node_cron_1 = __importDefault(require("node-cron"));
var client_1 = require("../../cache-store/client");
function getOTP() {
    function expireOTPCache(phoneNumber) {
        try {
            client_1.otpCacheStore.expire(phoneNumber);
        }
        catch (error) {
            console.error('Error expiring OTP from cache:', error);
        }
    }
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var otp, response, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        otp = (0, send_otp_1.generateOTP)();
                        return [4 /*yield*/, (0, send_otp_1.storeOTP)(request.query.toPhone, otp.toString())];
                    case 1:
                        _a.sent();
                        node_cron_1.default.schedule('*/2 * * * *', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                expireOTPCache(request.query.toPhone);
                                return [2 /*return*/];
                            });
                        }); });
                        return [4 /*yield*/, (0, send_otp_1.default)(request.query.toPhone, String(otp))];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: JSON.parse(response.config.data),
                                    message: 'OTP generated successfully!',
                                },
                            }];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                                body: {
                                    data: error_1,
                                    message: 'Failed to generate OTP',
                                },
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
}
exports.getOTP = getOTP;
function verifyOTP() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, phone, otp, designation, cacheStoreOTP, user, accessToken, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.body, phone = _a.phone, otp = _a.otp, designation = _a.designation;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, (0, send_otp_1.getOTPFromCacheStore)(phone)];
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
                        if (!(cacheStoreOTP === otp)) return [3 /*break*/, 9];
                        user = void 0;
                        if (!(designation === designations_1.DESIGNATION.NURSE)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_1.db.caregivers.findOne({ phone: phone })];
                    case 3:
                        user = _b.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!(designation === designations_1.DESIGNATION.PATIENT)) return [3 /*break*/, 6];
                        return [4 /*yield*/, db_1.db.patients.findOne({ phone: phone })];
                    case 5:
                        user = _b.sent();
                        return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, {
                            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                            body: {
                                data: null,
                                message: 'Only patients or caregivers can access this route',
                            },
                        }];
                    case 7:
                        if (!user) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        data: null,
                                        message: 'No such user with given phone. Please try registering again after 5 mins',
                                    },
                                }];
                        }
                        user.isPhoneVerified = true;
                        return [4 /*yield*/, user.save()];
                    case 8:
                        user = _b.sent();
                        accessToken = (0, token_1.createAccessToken)(user);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: user,
                                    accessToken: accessToken,
                                    message: 'OTP has been Verified',
                                },
                            }];
                    case 9: return [2 /*return*/, {
                            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                            body: {
                                data: null,
                                message: 'Wrong OTP',
                            },
                        }];
                    case 10:
                        error_2 = _b.sent();
                        console.log("error: ", error_2);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                                body: {
                                    data: null,
                                    message: 'FAILED TO VERIFY OTP',
                                },
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
}
exports.verifyOTP = verifyOTP;
//# sourceMappingURL=controller.js.map
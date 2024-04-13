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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = exports.deleteAccount = exports.adminSignin = exports.caregiverSignin = exports.patientSignin = exports.adminSignup = exports.caregiverSignup = exports.patientSignup = void 0;
var http_status_codes_1 = require("http-status-codes");
var db_1 = require("../../db");
var token_1 = require("../../services/token/token");
var argon2 = __importStar(require("argon2"));
var designations_1 = require("../../interfaces/designations");
function patientSignup() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, phone, dob, firstName, lastName, email, missingFields, patient, user;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.body, phone = _a.phone, dob = _a.dob, firstName = _a.firstName, lastName = _a.lastName, email = _a.email;
                        console.log("data: ", { phone: phone, dob: dob, firstName: firstName, lastName: lastName, email: email });
                        missingFields = [];
                        if (!phone) {
                            missingFields.push('phone');
                        }
                        if (!dob) {
                            missingFields.push('dob');
                        }
                        if (!firstName) {
                            missingFields.push('firstName');
                        }
                        if (!lastName) {
                            missingFields.push('lastName');
                        }
                        if (!email) {
                            missingFields.push('email');
                        }
                        if (missingFields.length > 0) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: "The following fields are missing: ".concat(missingFields.join(', ')),
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.patients.findOne({ phone: phone })];
                    case 1:
                        patient = _b.sent();
                        if (patient) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Phone number in use',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.patients.create({
                                phone: phone,
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                designation: designations_1.DESIGNATION.PATIENT,
                                dob: dob
                            })];
                    case 2:
                        user = _b.sent();
                        return [4 /*yield*/, user.save()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: user,
                                    message: 'Account created',
                                },
                            }];
                }
            });
        });
    };
}
exports.patientSignup = patientSignup;
function caregiverSignup() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, phone, password, firstName, lastName, caregiver, hash, user, accessToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.body, phone = _a.phone, password = _a.password, firstName = _a.firstName, lastName = _a.lastName;
                        if (!phone || !password || !firstName || !lastName) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Some fields are missing',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.caregivers.findOne({ phone: phone })];
                    case 1:
                        caregiver = _b.sent();
                        if (caregiver) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Phone number in use',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, argon2.hash(password, {
                                type: argon2.argon2id,
                            })];
                    case 2:
                        hash = _b.sent();
                        return [4 /*yield*/, db_1.db.caregivers.create({
                                phone: phone,
                                firstName: firstName,
                                lastName: lastName,
                                designation: designations_1.DESIGNATION.NURSE,
                                password: hash,
                            })];
                    case 3:
                        user = _b.sent();
                        return [4 /*yield*/, user.save()];
                    case 4:
                        _b.sent();
                        accessToken = (0, token_1.createAccessToken)(user);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: user,
                                    accessToken: accessToken,
                                    message: 'Account created',
                                },
                            }];
                }
            });
        });
    };
}
exports.caregiverSignup = caregiverSignup;
function adminSignup() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, firstName, lastName, user, hash, newUser, token;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.body, email = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName;
                        if (!email || !password || !firstName || !lastName) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Some fields are missing',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.admins.findOne({ email: email })];
                    case 1:
                        user = _b.sent();
                        if (user) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'email number in use',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, argon2.hash(password, {
                                type: argon2.argon2id,
                            })];
                    case 2:
                        hash = _b.sent();
                        return [4 /*yield*/, db_1.db.admins.create({
                                email: email,
                                firstName: firstName,
                                lastName: lastName,
                                designation: designations_1.DESIGNATION.ADMIN,
                                password: hash,
                            })];
                    case 3:
                        newUser = _b.sent();
                        return [4 /*yield*/, newUser.save()];
                    case 4:
                        _b.sent();
                        token = (0, token_1.createAccessToken)(newUser);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: newUser,
                                    token: token,
                                    message: 'Account created',
                                },
                            }];
                }
            });
        });
    };
}
exports.adminSignup = adminSignup;
function patientSignin() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var phone, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        phone = request.body.phone;
                        if (!request.body.phone) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Phone must be specified!',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.patients.findOne({ phone: phone })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                                    body: {
                                        message: 'No such user found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: null,
                                    message: 'Success',
                                },
                            }];
                }
            });
        });
    };
}
exports.patientSignin = patientSignin;
function caregiverSignin() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, phone, password, user, match, accessToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.body, phone = _a.phone, password = _a.password;
                        if (!phone || !password) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Some fields are missing',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.caregivers.findOne({ phone: phone })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                                    body: {
                                        message: 'Invalid Credentials',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, argon2.verify(user.password, password, {
                                type: argon2.argon2id,
                            })];
                    case 2:
                        match = _b.sent();
                        if (!match) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                                    body: {
                                        data: null,
                                        message: 'Invalid Credentials',
                                    },
                                }];
                        }
                        accessToken = (0, token_1.createAccessToken)(user);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: user,
                                    accessToken: accessToken,
                                    message: 'Signed in',
                                },
                            }];
                }
            });
        });
    };
}
exports.caregiverSignin = caregiverSignin;
function adminSignin() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, user, match, accessToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.body, email = _a.email, password = _a.password;
                        if (!email || !password) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Some fields are missing',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.admins.findOne({ email: email })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                                    body: {
                                        message: 'Invalid Credentials',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, argon2.verify(user.password, password, {
                                type: argon2.argon2id,
                            })];
                    case 2:
                        match = _b.sent();
                        if (!match) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                                    body: {
                                        data: null,
                                        message: 'Invalid Credentials',
                                    },
                                }];
                        }
                        accessToken = (0, token_1.createAccessToken)(user);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: user,
                                    accessToken: accessToken,
                                    message: 'Signed in',
                                },
                            }];
                }
            });
        });
    };
}
exports.adminSignin = adminSignin;
function deleteAccount() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function (_) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        statusCode: http_status_codes_1.StatusCodes.OK,
                        body: {
                            data: null,
                            message: 'account deleted',
                        },
                    }];
            });
        });
    };
}
exports.deleteAccount = deleteAccount;
function getAccessToken() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var designation, user, accessToken;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        designation = request.query.designation;
                        if (!designation) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'Designation must be specified',
                                        data: null,
                                    },
                                }];
                        }
                        if (!(designation === designations_1.DESIGNATION.PATIENT)) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db.patients.findById((_a = request.account) === null || _a === void 0 ? void 0 : _a.id)];
                    case 1:
                        user = _d.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        if (!(designation === designations_1.DESIGNATION.NURSE)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_1.db.caregivers.findById((_b = request.account) === null || _b === void 0 ? void 0 : _b.id)];
                    case 3:
                        user = _d.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!(designation === designations_1.DESIGNATION.ADMIN)) return [3 /*break*/, 6];
                        return [4 /*yield*/, db_1.db.caregivers.findById((_c = request.account) === null || _c === void 0 ? void 0 : _c.id)];
                    case 5:
                        user = _d.sent();
                        return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, {
                            statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
                            body: {
                                message: 'Invalid Designation',
                                data: null,
                            },
                        }];
                    case 7:
                        if (!user) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        data: user,
                                        message: 'No user found',
                                    },
                                }];
                        }
                        accessToken = (0, token_1.createAccessToken)(user);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: null,
                                    accessToken: accessToken,
                                    message: 'Access token has been reset!',
                                },
                            }];
                }
            });
        });
    };
}
exports.getAccessToken = getAccessToken;
//# sourceMappingURL=controller.js.map
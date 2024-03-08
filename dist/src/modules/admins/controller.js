"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.updateAdmin = exports.verifyPatient = exports.verifyCaregiver = exports.banPatient = exports.banCaregiver = exports.banAdmin = exports.getAdmin = exports.getAllAdmins = void 0;
var http_status_codes_1 = require("http-status-codes");
var db_1 = require("../../db");
function getAllAdmins() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function (_) {
        return __awaiter(this, void 0, void 0, function () {
            var admins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.admins.find({}).sort({ createdAt: "desc" })];
                    case 1:
                        admins = _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: admins,
                                    message: 'Admins Retrieved',
                                },
                            }];
                }
            });
        });
    };
}
exports.getAllAdmins = getAllAdmins;
function getAdmin() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var admin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.admins.findById(request.params.id)];
                    case 1:
                        admin = _a.sent();
                        if (!admin) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: 'No admin Found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: admin,
                                    message: 'Admin Retrieved',
                                },
                            }];
                }
            });
        });
    };
}
exports.getAdmin = getAdmin;
function banAdmin() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedAmin;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (((_a = request.account) === null || _a === void 0 ? void 0 : _a.id) === request.params.id) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: 'You cannot ban yourself, Please select a different admin to ban',
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.admins.findByIdAndUpdate(request.params.id, { $set: { isBanned: true } }, { new: true })];
                    case 1:
                        updatedAmin = _b.sent();
                        if (!updatedAmin) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: 'No admin Found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: updatedAmin,
                                    message: 'Admin banned',
                                },
                            }];
                }
            });
        });
    };
}
exports.banAdmin = banAdmin;
function banCaregiver() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var bannedCaregiver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.caregivers.findByIdAndUpdate(request.params.id, { $set: { isBanned: true } }, { new: true })];
                    case 1:
                        bannedCaregiver = _a.sent();
                        if (!bannedCaregiver) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: 'No such caregiver Found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: bannedCaregiver,
                                    message: 'Caregiver Successfully banned from using the application',
                                },
                            }];
                }
            });
        });
    };
}
exports.banCaregiver = banCaregiver;
function banPatient() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var bannedPatient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.patients.findByIdAndUpdate(request.params.id, { $set: { isBanned: true } }, { new: true })];
                    case 1:
                        bannedPatient = _a.sent();
                        if (!bannedPatient) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: 'No such patient Found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: bannedPatient,
                                    message: 'Patient Successfully banned from using the application!',
                                },
                            }];
                }
            });
        });
    };
}
exports.banPatient = banPatient;
function verifyCaregiver() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var verifiedCaregiver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.caregivers.findByIdAndUpdate(request.params.id, { isVerified: true }, { new: true })];
                    case 1:
                        verifiedCaregiver = _a.sent();
                        if (!verifiedCaregiver) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: 'No such caregiver Found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: verifiedCaregiver,
                                    message: 'Caregiver verified',
                                },
                            }];
                }
            });
        });
    };
}
exports.verifyCaregiver = verifyCaregiver;
function verifyPatient() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var verifiedPatient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.patients.findByIdAndUpdate(request.params.id, { isVerified: true }, { new: true })];
                    case 1:
                        verifiedPatient = _a.sent();
                        if (!verifiedPatient) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: 'No such patient Found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: verifiedPatient,
                                    message: 'Patient verified!',
                                },
                            }];
                }
            });
        });
    };
}
exports.verifyPatient = verifyPatient;
function updateAdmin() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var admin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.admins.findByIdAndUpdate(request.params.id, __assign({}, request.body), { new: true })];
                    case 1:
                        admin = _a.sent();
                        if (!admin) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: 'No admin Found',
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: admin,
                                    message: 'Admin updated',
                                },
                            }];
                }
            });
        });
    };
}
exports.updateAdmin = updateAdmin;
//# sourceMappingURL=controller.js.map
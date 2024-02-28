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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.getAppointment = exports.cancelAppointment = exports.confirmAppointment = exports.scheduleAppointment = exports.getPatientAppointments = exports.getCaregiverAppointments = exports.getAllAppointments = void 0;
var http_status_codes_1 = require("http-status-codes");
var db_1 = require("../../db");
function getAllAppointments() {
    return function (_) {
        return __awaiter(this, void 0, void 0, function () {
            var appointments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.appointments.find({}).sort({ createdAt: "desc" }).populate('patient').populate('caregiver')];
                    case 1:
                        appointments = _a.sent();
                        console.log("all:", appointments);
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: appointments,
                                    message: appointments.length === 0 ? 'No Appointments Scheduled' : 'All appointments retrieved',
                                },
                            }];
                }
            });
        });
    };
}
exports.getAllAppointments = getAllAppointments;
function getCaregiverAppointments() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var appointments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.appointments.find({
                            caregiver: {
                                _id: request.params.id
                            }
                        }).populate('patient').populate('caregiver')];
                    case 1:
                        appointments = _a.sent();
                        if (appointments.length > 0) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.OK,
                                    body: {
                                        data: appointments,
                                        message: 'Successfully fetched caregiver Appointments',
                                    },
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        data: null,
                                        message: 'No Appointment Found',
                                    },
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
}
exports.getCaregiverAppointments = getCaregiverAppointments;
function getPatientAppointments() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var appointments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.appointments.find({
                            patient: {
                                _id: request.params.id
                            }
                        }).populate('patient').populate('caregiver')];
                    case 1:
                        appointments = _a.sent();
                        if (appointments.length > 0) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.OK,
                                    body: {
                                        data: appointments,
                                        message: 'Successfully fetched patient Appointments',
                                    },
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        data: null,
                                        message: 'No Appointment Found',
                                    },
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
}
exports.getPatientAppointments = getPatientAppointments;
function scheduleAppointment() {
    return function (request) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var missingFields, appointments;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(request.body.title && request.body.description && request.body.notes)) {
                            missingFields = [];
                            if (!request.body.title) {
                                missingFields.push('title');
                            }
                            if (!request.body.caregiverId) {
                                missingFields.push('caregiverId');
                            }
                            if (!request.body.description) {
                                missingFields.push('description');
                            }
                            if (!request.body.notes) {
                                missingFields.push('notes');
                            }
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        message: "The following fields are missing: ".concat(missingFields.join(', ')),
                                        data: null,
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.appointments.create({
                                title: request.body.title,
                                description: request.body.description,
                                notes: request.body.notes,
                                patient: (_a = request.account) === null || _a === void 0 ? void 0 : _a.id,
                                caregiver: request.body.caregiverId
                            }).then(function (appointment) { return appointment.populate("patient").then(function (appointment) { return appointment.populate('caregiver'); }); })];
                    case 1:
                        appointments = _b.sent();
                        return [4 /*yield*/, appointments.save()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: appointments,
                                    message: 'Appointment Scheduled',
                                },
                            }];
                }
            });
        });
    };
}
exports.scheduleAppointment = scheduleAppointment;
function confirmAppointment() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var appointment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.appointments.findById(request.params.id).populate('patient').populate('caregiver')];
                    case 1:
                        appointment = _a.sent();
                        console.log("params::id--> ", request.params.id);
                        if (!appointment) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        data: null,
                                        message: 'Could not confirm appointment.',
                                    },
                                }];
                        }
                        return [4 /*yield*/, appointment.confirmAppointment()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: appointment,
                                    message: 'Appointment has been confirmed and initiated',
                                },
                            }];
                }
            });
        });
    };
}
exports.confirmAppointment = confirmAppointment;
function cancelAppointment() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var appointment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.appointments.findById(request.params.id).populate('patient').populate('caregiver')];
                    case 1:
                        appointment = _a.sent();
                        if (!appointment) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        data: null,
                                        message: 'Could not cancel appointment.',
                                    },
                                }];
                        }
                        return [4 /*yield*/, appointment.cancelAppointment(request.body.reason)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: appointment,
                                    message: 'Successfully cancelled appointment',
                                },
                            }];
                }
            });
        });
    };
}
exports.cancelAppointment = cancelAppointment;
function getAppointment() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var appointment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.appointments.findById(request.params.id).populate("caregiver").populate("patient")];
                    case 1:
                        appointment = _a.sent();
                        if (!appointment) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        data: null,
                                        message: 'Could not get appointment.',
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: appointment,
                                    message: 'Successfully fetched appointment',
                                },
                            }];
                }
            });
        });
    };
}
exports.getAppointment = getAppointment;
function deleteAppointment() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var appointment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.appointments.findByIdAndDelete(request.params.id)];
                    case 1:
                        appointment = _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: appointment,
                                    message: 'Successfully deleted appointment',
                                },
                            }];
                }
            });
        });
    };
}
exports.deleteAppointment = deleteAppointment;
//# sourceMappingURL=controller.js.map
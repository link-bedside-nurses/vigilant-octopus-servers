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
exports.completeCaregiverProfile = void 0;
var http_status_codes_1 = require("http-status-codes");
var db_1 = require("../../db");
function completeCaregiverProfile() {
    return function (request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var caregiverId, _c, phone, firstName, lastName, dateOfBirth, nin, medicalLicenseNumber, experience, description, location, languages, affiliations, placeOfReception, speciality, servicesOffered, imageUrl, updatedCaregiver;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        caregiverId = (_a = request === null || request === void 0 ? void 0 : request.account) === null || _a === void 0 ? void 0 : _a.id;
                        _c = request.body, phone = _c.phone, firstName = _c.firstName, lastName = _c.lastName, dateOfBirth = _c.dateOfBirth, nin = _c.nin, medicalLicenseNumber = _c.medicalLicenseNumber, experience = _c.experience, description = _c.description, location = _c.location, languages = _c.languages, affiliations = _c.affiliations, placeOfReception = _c.placeOfReception, speciality = _c.speciality, servicesOffered = _c.servicesOffered, imageUrl = _c.imageUrl;
                        if (!caregiverId ||
                            !phone ||
                            !firstName ||
                            !lastName ||
                            !dateOfBirth ||
                            !nin ||
                            !medicalLicenseNumber ||
                            !experience ||
                            !description ||
                            !location ||
                            !languages ||
                            !affiliations ||
                            !placeOfReception ||
                            !speciality ||
                            !servicesOffered ||
                            !imageUrl) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                                    body: {
                                        data: null,
                                        message: 'Incomplete or invalid request data',
                                    },
                                }];
                        }
                        return [4 /*yield*/, db_1.db.caregivers.findByIdAndUpdate((_b = request === null || request === void 0 ? void 0 : request.account) === null || _b === void 0 ? void 0 : _b.id, {
                                phone: phone,
                                firstName: firstName,
                                lastName: lastName,
                                dateOfBirth: dateOfBirth,
                                nin: nin,
                                medicalLicenseNumber: medicalLicenseNumber,
                                experience: experience,
                                description: description,
                                location: location,
                                languages: languages,
                                affiliations: affiliations,
                                placeOfReception: placeOfReception,
                                speciality: speciality,
                                servicesOffered: servicesOffered,
                                imageUrl: imageUrl,
                            }, { new: true })];
                    case 1:
                        updatedCaregiver = _d.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: updatedCaregiver,
                                    message: 'Profile completed',
                                },
                            }];
                }
            });
        });
    };
}
exports.completeCaregiverProfile = completeCaregiverProfile;
//# sourceMappingURL=controller.js.map
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
exports.seedAdmins = exports.seedPatients = exports.seedCaregivers = exports.seedRatings = exports.seedAppointments = exports.seedPayments = void 0;
var db_1 = require("../db");
var appointment_statuses_1 = require("../interfaces/appointment-statuses");
var designations_1 = require("../interfaces/designations");
var faker_1 = require("@faker-js/faker");
var geolib = __importStar(require("geolib"));
function seedPayments() {
    return __awaiter(this, void 0, void 0, function () {
        var patients, appointments, payments, i, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.payments.deleteMany({}, { maxTimeMS: 30000 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.db.patients.find({})];
                case 2:
                    patients = _a.sent();
                    return [4 /*yield*/, db_1.db.appointments.find({})];
                case 3:
                    appointments = _a.sent();
                    payments = [];
                    for (i = 0; i < 10; i++) {
                        payment = {
                            patient: faker_1.faker.helpers.arrayElement(patients),
                            appointment: faker_1.faker.helpers.arrayElement(appointments),
                            amount: faker_1.faker.helpers.arrayElement([1200, 15000, 50000, 54000, 25000, 100000, 51000, 32000]),
                            comment: faker_1.faker.helpers.arrayElement(["alsdfasdfasd", "asdfasdfasd", "asdfasdasd"]),
                        };
                        payments.push(payment);
                    }
                    return [4 /*yield*/, db_1.db.payments.insertMany(payments)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.seedPayments = seedPayments;
function seedAppointments() {
    return __awaiter(this, void 0, void 0, function () {
        var caregiverIds, patientIds, appointments, i, appointment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.appointments.deleteMany({}, { maxTimeMS: 30000 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.db.caregivers.find({})];
                case 2:
                    caregiverIds = (_a.sent()).map((function (c) { return c._id; }));
                    return [4 /*yield*/, db_1.db.patients.find({})];
                case 3:
                    patientIds = (_a.sent()).map(function (p) { return p._id; });
                    appointments = [];
                    for (i = 0; i < 10; i++) {
                        appointment = {
                            patient: faker_1.faker.helpers.arrayElement(patientIds),
                            caregiver: faker_1.faker.helpers.arrayElement(caregiverIds),
                            title: faker_1.faker.lorem.slug(5),
                            status: faker_1.faker.helpers.arrayElement(Object.values(appointment_statuses_1.APPOINTMENT_STATUSES)),
                            date: faker_1.faker.date.past(),
                            description: faker_1.faker.lorem.lines(2),
                            notes: faker_1.faker.lorem.lines(3),
                        };
                        appointments.push(appointment);
                    }
                    return [4 /*yield*/, db_1.db.appointments.insertMany(appointments)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.seedAppointments = seedAppointments;
function seedRatings() {
    return __awaiter(this, void 0, void 0, function () {
        var caregiverIds, patientIds, ratings, i, rating;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.ratings.deleteMany({}, { maxTimeMS: 30000 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db_1.db.caregivers.find({})];
                case 2:
                    caregiverIds = (_a.sent()).map((function (c) { return c._id; }));
                    return [4 /*yield*/, db_1.db.patients.find({})];
                case 3:
                    patientIds = (_a.sent()).map(function (p) { return p._id; });
                    ratings = [];
                    for (i = 0; i < 10; i++) {
                        rating = {
                            patient: faker_1.faker.helpers.arrayElement(patientIds),
                            caregiver: faker_1.faker.helpers.arrayElement(caregiverIds),
                            review: faker_1.faker.lorem.sentence({ max: 20, min: 8 }),
                            value: faker_1.faker.number.int({ min: 1, max: 5 }),
                        };
                        ratings.push(rating);
                    }
                    return [4 /*yield*/, db_1.db.ratings.insertMany(ratings)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.seedRatings = seedRatings;
function seedCaregivers() {
    return __awaiter(this, void 0, void 0, function () {
        var centerCoords, caregivers, i, caregiver;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.caregivers.deleteMany({}, { maxTimeMS: 30000 })];
                case 1:
                    _a.sent();
                    centerCoords = {
                        lat: 0.3322221,
                        lng: 32.5704806,
                    };
                    caregivers = [];
                    for (i = 0; i < 10; i++) {
                        caregiver = {
                            designation: designations_1.DESIGNATION.NURSE,
                            phone: "256456789".concat(i.toString().padStart(2, '0')),
                            firstName: faker_1.faker.person.firstName(),
                            lastName: faker_1.faker.person.lastName(),
                            password: "password",
                            location: generateRandomLocation(centerCoords),
                            isPhoneVerified: faker_1.faker.datatype.boolean(),
                            dateOfBirth: faker_1.faker.date.past(),
                            nin: "NIN".concat(i.toString().padStart(2, '0')),
                            medicalLicenseNumber: faker_1.faker.number.int({ min: 10000000 }),
                            description: faker_1.faker.person.bio(),
                            rating: i % 5 + 1,
                            placeOfReception: faker_1.faker.location.city(),
                            address: faker_1.faker.location.city(),
                            speciality: faker_1.faker.helpers.arrayElements(['elderly', 'infant', 'dental', 'women'], 2),
                            languages: faker_1.faker.helpers.arrayElement(['English', 'Luganda', 'kiswahili']),
                            affiliations: faker_1.faker.helpers.arrayElements(['Affiliation1', 'Affiliation2', 'Affiliation3', 'Affiliation1'], 2),
                            experience: i * 2,
                            servicesOffered: faker_1.faker.helpers.arrayElements(['elderly', 'infant', 'dental', 'women'], 2),
                            imgUrl: faker_1.faker.image.avatar(),
                            isBanned: faker_1.faker.datatype.boolean(),
                            isDeactivated: faker_1.faker.datatype.boolean(),
                            isVerified: faker_1.faker.datatype.boolean(),
                        };
                        caregivers.push(caregiver);
                    }
                    return [4 /*yield*/, db_1.db.caregivers.insertMany(caregivers)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.seedCaregivers = seedCaregivers;
function seedPatients() {
    return __awaiter(this, void 0, void 0, function () {
        var centerCoords, patients, i, patient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    centerCoords = {
                        lat: 0.3322221,
                        lng: 32.5704806,
                    };
                    return [4 /*yield*/, db_1.db.patients.deleteMany({}, { maxTimeMS: 30000 })];
                case 1:
                    _a.sent();
                    patients = [];
                    for (i = 0; i < 10; i++) {
                        patient = {
                            designation: designations_1.DESIGNATION.PATIENT,
                            phone: "256456789".concat(i.toString().padStart(2, '0')),
                            firstName: faker_1.faker.person.firstName(),
                            lastName: faker_1.faker.person.lastName(),
                            password: "password",
                            location: generateRandomLocation(centerCoords),
                            isPhoneVerified: faker_1.faker.datatype.boolean(),
                            dob: faker_1.faker.date.past(),
                            isBanned: faker_1.faker.datatype.boolean(),
                            isDeactivated: faker_1.faker.datatype.boolean(),
                            isVerified: faker_1.faker.datatype.boolean(),
                            email: faker_1.faker.internet.email(),
                        };
                        patients.push(patient);
                    }
                    return [4 /*yield*/, db_1.db.patients.insertMany(patients)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.seedPatients = seedPatients;
function seedAdmins() {
    return __awaiter(this, void 0, void 0, function () {
        var admins, i, admin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.admins.deleteMany({}, { maxTimeMS: 30000 })];
                case 1:
                    _a.sent();
                    admins = [];
                    for (i = 0; i < 10; i++) {
                        admin = {
                            designation: designations_1.DESIGNATION.ADMIN,
                            firstName: faker_1.faker.person.firstName(),
                            lastName: faker_1.faker.person.lastName(),
                            password: "password",
                            isEmailVerified: faker_1.faker.datatype.boolean(),
                            isBanned: faker_1.faker.datatype.boolean(),
                            isDeactivated: faker_1.faker.datatype.boolean(),
                            email: faker_1.faker.internet.email(),
                        };
                        admins.push(admin);
                    }
                    return [4 /*yield*/, db_1.db.admins.insertMany(admins)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.seedAdmins = seedAdmins;
function generateRandomLocation(centerCoords) {
    var maxDistance = 25000; // 25 km in meters
    var randomDistance = Math.random() * maxDistance;
    var randomBearing = Math.random() * 360;
    var newCoords = geolib.computeDestinationPoint(centerCoords, randomDistance, randomBearing);
    return {
        type: 'Point',
        coordinates: [newCoords.latitude, newCoords.longitude],
    };
}
//# sourceMappingURL=seed.js.map
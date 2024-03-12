"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var typegoose_1 = require("@typegoose/typegoose");
var Appointment_1 = require("../db/schemas/Appointment");
var Rating_1 = require("../db/schemas/Rating");
var Caregiver_1 = require("../db/schemas/Caregiver");
var Payment_1 = require("../db/schemas/Payment");
var Patient_1 = require("../db/schemas/Patient");
var Admin_1 = require("../db/schemas/Admin");
exports.db = Object.freeze({
    appointments: (0, typegoose_1.getModelForClass)(Appointment_1.Appointment),
    ratings: (0, typegoose_1.getModelForClass)(Rating_1.Rating),
    caregivers: (0, typegoose_1.getModelForClass)(Caregiver_1.Caregiver),
    patients: (0, typegoose_1.getModelForClass)(Patient_1.Patient),
    admins: (0, typegoose_1.getModelForClass)(Admin_1.Admin),
    payments: (0, typegoose_1.getModelForClass)(Payment_1.Payment),
});
//# sourceMappingURL=index.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Caregiver = void 0;
var designations_1 = require("../../interfaces/designations");
var typegoose_1 = require("@typegoose/typegoose");
var Location_1 = require("./Location");
var Caregiver = /** @class */ (function () {
    function Caregiver() {
    }
    __decorate([
        (0, typegoose_1.prop)({
            type: String,
            required: true,
            trim: true,
            enum: [designations_1.DESIGNATION.PATIENT, designations_1.DESIGNATION.NURSE, designations_1.DESIGNATION.ADMIN],
            default: designations_1.DESIGNATION.NURSE
        }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "designation", void 0);
    __decorate([
        (0, typegoose_1.prop)({
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "phone", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true, minlength: 2, maxlength: 250, trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "firstName", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true, minlength: 2, maxlength: 250, trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "lastName", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "password", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Location_1.Location, index: '2dsphere' }),
        __metadata("design:type", Location_1.Location)
    ], Caregiver.prototype, "location", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Caregiver.prototype, "isPhoneVerified", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Date, required: false, default: new Date() }),
        __metadata("design:type", Date)
    ], Caregiver.prototype, "dateOfBirth", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false, default: '', trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "nin", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false, default: '', trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "medicalLicenseNumber", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false, default: '', trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "description", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Number, required: false, default: 0 }),
        __metadata("design:type", Number)
    ], Caregiver.prototype, "rating", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false, default: '', trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "placeOfReception", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false, default: '', trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "address", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: [String], required: false, default: [] }),
        __metadata("design:type", Array)
    ], Caregiver.prototype, "speciality", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: [String], required: false, default: [] }),
        __metadata("design:type", Array)
    ], Caregiver.prototype, "languages", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: [String], required: false, default: [] }),
        __metadata("design:type", Array)
    ], Caregiver.prototype, "affiliations", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Number, required: false, default: 0 }),
        __metadata("design:type", Number)
    ], Caregiver.prototype, "experience", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: [String], required: false, default: [] }),
        __metadata("design:type", Array)
    ], Caregiver.prototype, "servicesOffered", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false, default: '', trim: true }),
        __metadata("design:type", String)
    ], Caregiver.prototype, "imgUrl", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Caregiver.prototype, "isBanned", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Caregiver.prototype, "isDeactivated", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Caregiver.prototype, "isVerified", void 0);
    Caregiver = __decorate([
        (0, typegoose_1.modelOptions)({
            schemaOptions: {
                id: false,
                virtuals: true,
                timestamps: true,
                toObject: { virtuals: true },
                toJSON: {
                    virtuals: true,
                    transform: function (_doc, ret) {
                        delete ret.password;
                        delete ret.__v;
                    },
                },
            },
            options: { allowMixed: typegoose_1.Severity.ALLOW },
        }),
        (0, typegoose_1.index)({ title: 'text', location: '2dsphere' })
    ], Caregiver);
    return Caregiver;
}());
exports.Caregiver = Caregiver;
//# sourceMappingURL=Caregiver.js.map
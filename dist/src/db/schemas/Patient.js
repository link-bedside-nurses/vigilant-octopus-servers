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
exports.Patient = void 0;
var designations_1 = require("../../interfaces/designations");
var typegoose_1 = require("@typegoose/typegoose");
var Patient = /** @class */ (function () {
    function Patient() {
    }
    __decorate([
        (0, typegoose_1.prop)({
            type: String,
            required: true,
            enum: [designations_1.DESIGNATION.PATIENT, designations_1.DESIGNATION.NURSE, designations_1.DESIGNATION.ADMIN],
        }),
        __metadata("design:type", String)
    ], Patient.prototype, "designation", void 0);
    __decorate([
        (0, typegoose_1.prop)({
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        }),
        __metadata("design:type", String)
    ], Patient.prototype, "phone", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true, minlength: 2, maxlength: 250, trim: true }),
        __metadata("design:type", String)
    ], Patient.prototype, "name", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "isPhoneVerified", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "isBanned", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "isVerified", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Patient.prototype, "isDeactivated", void 0);
    Patient = __decorate([
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
        })
    ], Patient);
    return Patient;
}());
exports.Patient = Patient;
//# sourceMappingURL=Patient.js.map
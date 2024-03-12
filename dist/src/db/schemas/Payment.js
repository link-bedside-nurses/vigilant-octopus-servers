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
exports.Payment = void 0;
var typegoose_1 = require("@typegoose/typegoose");
var Appointment_1 = require("./Appointment");
var Patient_1 = require("./Patient");
var Payment = /** @class */ (function () {
    function Payment() {
    }
    __decorate([
        (0, typegoose_1.prop)({
            required: true,
            type: typegoose_1.mongoose.Document,
            ref: Appointment_1.Appointment,
        }),
        __metadata("design:type", Appointment_1.Appointment)
    ], Payment.prototype, "appointment", void 0);
    __decorate([
        (0, typegoose_1.prop)({
            required: true,
            type: typegoose_1.mongoose.Document,
            ref: Patient_1.Patient,
        }),
        __metadata("design:type", Patient_1.Patient)
    ], Payment.prototype, "patient", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true }),
        __metadata("design:type", Number)
    ], Payment.prototype, "amount", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true }),
        __metadata("design:type", String)
    ], Payment.prototype, "comment", void 0);
    Payment = __decorate([
        (0, typegoose_1.modelOptions)({
            schemaOptions: {
                id: false,
                virtuals: true,
                timestamps: true,
                toObject: { virtuals: true },
                toJSON: {
                    virtuals: true,
                    transform: function (_doc, ret) {
                        delete ret.__v;
                    },
                },
            },
            options: { allowMixed: typegoose_1.Severity.ALLOW },
        })
    ], Payment);
    return Payment;
}());
exports.Payment = Payment;
//# sourceMappingURL=Payment.js.map
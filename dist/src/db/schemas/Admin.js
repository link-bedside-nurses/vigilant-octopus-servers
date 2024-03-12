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
exports.Admin = void 0;
var designations_1 = require("../../interfaces/designations");
var typegoose_1 = require("@typegoose/typegoose");
var Admin = /** @class */ (function () {
    function Admin() {
    }
    __decorate([
        (0, typegoose_1.prop)({
            type: String,
            required: true,
            enum: [designations_1.DESIGNATION.PATIENT, designations_1.DESIGNATION.NURSE, designations_1.DESIGNATION.ADMIN],
        }),
        __metadata("design:type", String)
    ], Admin.prototype, "designation", void 0);
    __decorate([
        (0, typegoose_1.prop)({
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        }),
        __metadata("design:type", String)
    ], Admin.prototype, "email", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true, minlength: 2, maxlength: 250, trim: true }),
        __metadata("design:type", String)
    ], Admin.prototype, "firstName", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: true, minlength: 2, maxlength: 250, trim: true }),
        __metadata("design:type", String)
    ], Admin.prototype, "lastName", void 0);
    __decorate([
        (0, typegoose_1.prop)({
            type: Object,
            required: false,
            default: {
                lng: 0,
                lat: 0,
            },
        }),
        (0, typegoose_1.prop)({ type: String, required: true }),
        __metadata("design:type", String)
    ], Admin.prototype, "password", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Admin.prototype, "isBanned", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Admin.prototype, "isEmailVerified", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: Boolean, required: false, default: false }),
        __metadata("design:type", Boolean)
    ], Admin.prototype, "isDeactivated", void 0);
    Admin = __decorate([
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
    ], Admin);
    return Admin;
}());
exports.Admin = Admin;
//# sourceMappingURL=Admin.js.map
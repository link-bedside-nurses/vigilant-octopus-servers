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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rating = void 0;
var typegoose_1 = require("@typegoose/typegoose");
var Caregiver_1 = require("./Caregiver");
var Patient_1 = require("./Patient");
var mongoose_1 = __importDefault(require("mongoose"));
var Rating = /** @class */ (function () {
    function Rating() {
    }
    __decorate([
        (0, typegoose_1.prop)({ type: mongoose_1.default.Types.ObjectId, required: true, ref: Patient_1.Patient }),
        __metadata("design:type", Object)
    ], Rating.prototype, "patient", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: mongoose_1.default.Types.ObjectId, required: true, ref: Caregiver_1.Caregiver, index: true }),
        __metadata("design:type", Object)
    ], Rating.prototype, "caregiver", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, default: '' }),
        __metadata("design:type", String)
    ], Rating.prototype, "review", void 0);
    __decorate([
        (0, typegoose_1.prop)({ required: true, min: 1, max: 5 }),
        __metadata("design:type", Number)
    ], Rating.prototype, "value", void 0);
    Rating = __decorate([
        (0, typegoose_1.modelOptions)({
            schemaOptions: {
                id: false,
                virtuals: true,
                timestamps: true,
                toJSON: {
                    virtuals: true,
                    transform: function (_doc, ret) {
                        delete ret.__v;
                    },
                },
            },
            options: { allowMixed: typegoose_1.Severity.ALLOW },
        }),
        (0, typegoose_1.index)({ caregiver: "text" })
    ], Rating);
    return Rating;
}());
exports.Rating = Rating;
//# sourceMappingURL=Rating.js.map
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
exports.Appointment = void 0;
var Caregiver_1 = require("../../db/schemas/Caregiver");
var appointment_statuses_1 = require("../../interfaces/appointment-statuses");
var typegoose_1 = require("@typegoose/typegoose");
var Patient_1 = require("./Patient");
var Appointment = /** @class */ (function () {
    function Appointment() {
    }
    Appointment.prototype.confirmAppointment = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.status = appointment_statuses_1.APPOINTMENT_STATUSES.CONFIRMED;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Appointment.prototype.cancelAppointment = function (reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.status = appointment_statuses_1.APPOINTMENT_STATUSES.CANCELLED;
                        this.cancellationReason = reason;
                        return [4 /*yield*/, this.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, typegoose_1.prop)({ type: typegoose_1.mongoose.Types.ObjectId, required: true, ref: Patient_1.Patient }),
        __metadata("design:type", Object)
    ], Appointment.prototype, "patient", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: typegoose_1.mongoose.Types.ObjectId, required: true, ref: Caregiver_1.Caregiver, index: true }),
        __metadata("design:type", Object)
    ], Appointment.prototype, "caregiver", void 0);
    __decorate([
        (0, typegoose_1.prop)({ required: true, index: true }),
        __metadata("design:type", String)
    ], Appointment.prototype, "title", void 0);
    __decorate([
        (0, typegoose_1.prop)({ required: true, default: Date.now() }),
        __metadata("design:type", Date)
    ], Appointment.prototype, "date", void 0);
    __decorate([
        (0, typegoose_1.prop)({
            enum: appointment_statuses_1.APPOINTMENT_STATUSES,
            default: appointment_statuses_1.APPOINTMENT_STATUSES.PENDING,
            index: true,
        }),
        __metadata("design:type", String)
    ], Appointment.prototype, "status", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false, default: '' }),
        __metadata("design:type", String)
    ], Appointment.prototype, "cancellationReason", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false }),
        __metadata("design:type", String)
    ], Appointment.prototype, "description", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: String, required: false }),
        __metadata("design:type", String)
    ], Appointment.prototype, "notes", void 0);
    Appointment = __decorate([
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
    ], Appointment);
    return Appointment;
}());
exports.Appointment = Appointment;
//# sourceMappingURL=Appointment.js.map
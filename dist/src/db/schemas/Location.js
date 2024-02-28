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
exports.Location = void 0;
var typegoose_1 = require("@typegoose/typegoose");
var Location = /** @class */ (function () {
    function Location() {
    }
    __decorate([
        (0, typegoose_1.prop)({ type: String, default: 'Point', enum: ['Point'] }),
        __metadata("design:type", String)
    ], Location.prototype, "type", void 0);
    __decorate([
        (0, typegoose_1.prop)({ type: [Number] }),
        __metadata("design:type", Array)
    ], Location.prototype, "coordinates", void 0);
    Location = __decorate([
        (0, typegoose_1.modelOptions)({ schemaOptions: { _id: false, versionKey: false }, options: { allowMixed: typegoose_1.Severity.ALLOW } })
    ], Location);
    return Location;
}());
exports.Location = Location;
//# sourceMappingURL=Location.js.map
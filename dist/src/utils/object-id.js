"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var ObjectId = Object.freeze({
    getId: function () { return mongoose_1.default.Schema.ObjectId.toString(); },
    isValid: mongoose_1.default.isValidObjectId,
});
exports.default = ObjectId;
//# sourceMappingURL=object-id.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectID = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var utils_1 = require("../utils");
var validateObjectID = function (req, _res, next) {
    if (!req.params.id || !mongoose_1.default.isValidObjectId(req.params.id))
        return next(new utils_1.Exception("Invalid object id!"));
    next();
};
exports.validateObjectID = validateObjectID;
//# sourceMappingURL=validate-objectid.js.map
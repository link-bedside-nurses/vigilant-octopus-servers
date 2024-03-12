"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessToken = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var env_vars_1 = __importDefault(require("../../constants/env-vars"));
function createAccessToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user === null || user === void 0 ? void 0 : user._id,
        phone: user === null || user === void 0 ? void 0 : user.phone,
        email: user === null || user === void 0 ? void 0 : user.email,
        designation: user === null || user === void 0 ? void 0 : user.designation,
    }, env_vars_1.default.getAccessTokenSecret());
}
exports.createAccessToken = createAccessToken;
//# sourceMappingURL=createAccessToken.js.map
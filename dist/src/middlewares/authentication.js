"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = __importStar(require("jsonwebtoken"));
var http_status_codes_1 = require("http-status-codes");
var utils_1 = require("../utils");
var constants_1 = require("../constants");
function authenticate(request, _response, next) {
    if (!request.headers.authorization || !request.headers.authorization.split(' ').includes('Bearer')) {
        return next(new utils_1.Exception('Unauthorized!', http_status_codes_1.StatusCodes.UNAUTHORIZED));
    }
    var token = request.headers.authorization.split('Bearer ')[1].trim();
    if (!token)
        return next(new utils_1.Exception('Missing token!', http_status_codes_1.StatusCodes.UNAUTHORIZED));
    var decoded = jwt.verify(token, constants_1.EnvironmentVars.getAccessTokenSecret());
    if (!decoded || !decoded.id)
        return next(new utils_1.Exception('Invalid Access Token!', http_status_codes_1.StatusCodes.UNAUTHORIZED));
    request.account = {
        id: decoded.id,
        phone: decoded.phone,
        email: decoded.email,
        designation: decoded.designation,
    };
    next();
}
exports.default = authenticate;
//# sourceMappingURL=authentication.js.map
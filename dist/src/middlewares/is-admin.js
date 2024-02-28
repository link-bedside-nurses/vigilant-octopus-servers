"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var designations_1 = require("../interfaces/designations");
var utils_1 = require("../utils");
var http_status_codes_1 = require("http-status-codes");
function authorized(request, _response, next) {
    var _a;
    if (((_a = request.account) === null || _a === void 0 ? void 0 : _a.designation) !== designations_1.DESIGNATION.ADMIN) {
        return next(new utils_1.Exception('Only admins can access this!', http_status_codes_1.StatusCodes.FORBIDDEN));
    }
    next();
}
exports.default = authorized;
//# sourceMappingURL=is-admin.js.map
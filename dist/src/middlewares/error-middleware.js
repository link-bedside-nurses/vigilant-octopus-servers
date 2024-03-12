"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorMiddleware(error, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    var _a;
    var status = error.statusCode || 500;
    var message = error.message;
    // Log error
    console.error(error);
    // document uniqueness and duplicates error
    if (error.code === 11000 && error.keyValue !== undefined) {
        var key = Object.keys(error.keyValue)[0];
        message = "".concat(key.charAt(0).toUpperCase() + key.slice(1), ": '").concat(error.keyValue[key], "' is already taken");
        status = 400;
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        status = 400;
        message = "Provided Id is an invalid ObjectId.";
    }
    // Custom error, from zod for now
    if (error.errors && error.errors.length > 0) {
        status = 400;
        message = (_a = error.errors[0].error) !== null && _a !== void 0 ? _a : error.message;
    }
    res.status(status).send({
        status: status,
        message: message,
    });
}
exports.default = errorMiddleware;
//# sourceMappingURL=error-middleware.js.map
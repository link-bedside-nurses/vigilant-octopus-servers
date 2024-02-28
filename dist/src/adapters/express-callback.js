"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function makeCallback(controllerCallback) {
    return function (request, response, next) {
        var httpRequest = {
            body: request.body,
            query: request.query,
            params: request.params,
            ip: request.ip,
            method: request.method,
            path: request.path,
            headers: __assign({}, request.headers),
            account: request.account,
        };
        controllerCallback(httpRequest)
            .then(function (httpResponse) {
            if (httpResponse.headers) {
                response.set(httpResponse.headers);
            }
            response.type('application/json');
            response.status(httpResponse.statusCode || 200).send(__assign({}, httpResponse.body));
        })
            .catch(function (error) {
            return next(error);
        });
    };
}
exports.default = makeCallback;
//# sourceMappingURL=express-callback.js.map
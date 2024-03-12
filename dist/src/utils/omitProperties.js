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
function omitProperties(obj, propertiesToOmit) {
    var propsToOmit = Array.isArray(propertiesToOmit) ? propertiesToOmit : [propertiesToOmit];
    var result = Object.keys(obj).reduce(function (acc, prop) {
        var _a;
        if (!propsToOmit.includes(prop)) {
            return __assign(__assign({}, acc), (_a = {}, _a[prop] = obj[prop], _a));
        }
        return acc;
    }, {});
    return result;
}
exports.default = omitProperties;
//# sourceMappingURL=omitProperties.js.map
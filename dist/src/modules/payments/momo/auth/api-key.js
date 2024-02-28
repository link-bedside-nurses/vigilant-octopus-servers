"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../../../constants");
var axios_1 = __importDefault(require("axios"));
function createMomoBearerToken() {
    var data = '';
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: "".concat(constants_1.uris.momo_sandbox, "/v1_0/apiuser/").concat(constants_1.EnvironmentVars.getXReferenceId(), "/").concat(constants_1.EnvironmentVars.getApiKey()),
        headers: {
            'Ocp-Apim-Subscription-Key': constants_1.EnvironmentVars.getOcpApimSubscriptionKey()
        },
        data: data
    };
    return axios_1.default.request(config);
}
exports.default = createMomoBearerToken;
//# sourceMappingURL=api-key.js.map
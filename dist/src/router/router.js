"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var routes_1 = __importDefault(require("../modules/appointments/routes"));
var routes_2 = __importDefault(require("../modules/profile/routes"));
var routes_3 = __importDefault(require("../modules/ratings/routes"));
var routes_4 = __importDefault(require("../modules/test/routes"));
var routes_5 = __importDefault(require("../modules/auth/routes"));
var routes_6 = __importDefault(require("../modules/patients/routes"));
var routes_7 = __importDefault(require("../modules/caregivers/routes"));
var routes_8 = __importDefault(require("../modules/me/routes"));
var routes_9 = __importDefault(require("../modules/payments/routes"));
var routes_10 = __importDefault(require("../modules/admins/routes"));
var express_1 = __importDefault(require("express"));
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
var compression_1 = __importDefault(require("compression"));
var cors_1 = __importDefault(require("cors"));
var helmet_1 = __importDefault(require("helmet"));
var morgan_1 = __importDefault(require("morgan"));
var promises_1 = require("fs/promises");
var node_path_1 = __importDefault(require("node:path"));
var constants_1 = require("../constants");
var error_middleware_1 = __importDefault(require("../middlewares/error-middleware"));
var routes_11 = require("../modules/sms/routes");
var privacy_1 = require("../privacy");
var routes_12 = require("../modules/email/routes");
var routes_13 = require("../modules/dashboard/routes");
var http_status_codes_1 = require("http-status-codes");
var router = express_1.default.Router();
router.use((0, cors_1.default)());
router.use((0, compression_1.default)());
router.use((0, helmet_1.default)());
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: true }));
router.use(express_1.default.static(node_path_1.default.join(__dirname, 'public')));
router.use((0, morgan_1.default)('combined', {
    stream: {
        write: function (str) {
            return __awaiter(this, void 0, void 0, function () {
                var log;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            log = new Uint8Array(Buffer.from(str));
                            process.stdout.write(log);
                            return [4 /*yield*/, (0, promises_1.appendFile)(constants_1.EnvironmentVars.getNodeEnv() === 'development' ? 'logs.dev.log' : "logs.prod.log", log)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
    }
}));
var ONE_MINUTE = 1 * 60 * 1000;
router.use((0, express_rate_limit_1.default)({
    windowMs: ONE_MINUTE,
    limit: constants_1.EnvironmentVars.getNodeEnv() === 'production' ? 60 : Number.MAX_SAFE_INTEGER,
    validate: {
        trustProxy: false,
        xForwardedForHeader: false,
    }
}));
router.use('/test', routes_4.default);
router.use('/auth', routes_5.default);
router.use('/appointments', routes_1.default);
router.use('/dashboard', routes_13.dashboardRouter);
router.use('/profile', routes_2.default);
router.use('/ratings', routes_3.default);
router.use('/patients', routes_6.default);
router.use('/caregivers', routes_7.default);
router.use('/admins', routes_10.default);
router.use('/payments', routes_9.default);
router.use('/otp', routes_11.otpRouter);
router.use('/mail', routes_12.emailRouter);
router.use('/me', routes_8.default);
router.use(error_middleware_1.default);
router.get('/privacy', function (_, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(privacy_1.html);
});
router.use('/', function (request, response) {
    return response.status(http_status_codes_1.StatusCodes.NOT_FOUND).send({ message: 'SERVER IS ONLINE!', requestHeaders: request.headers });
});
router.use('*', function (request, response) {
    return response.status(http_status_codes_1.StatusCodes.NOT_FOUND).send({ message: 'ROUTE NOT FOUND!', requestHeaders: request.headers });
});
exports.default = router;
//# sourceMappingURL=router.js.map
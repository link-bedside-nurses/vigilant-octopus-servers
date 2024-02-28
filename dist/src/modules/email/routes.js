"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailRouter = void 0;
var express_callback_1 = __importDefault(require("../../adapters/express-callback"));
var express_1 = require("express");
var controller_1 = require("../../modules/email/controller");
var router = (0, express_1.Router)();
exports.emailRouter = router;
router.get('/', (0, express_callback_1.default)((0, controller_1.sendEmail)()));
router.post('/verify', (0, express_callback_1.default)((0, controller_1.verifyEmail)()));
//# sourceMappingURL=routes.js.map
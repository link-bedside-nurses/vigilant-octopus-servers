"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_callback_1 = __importDefault(require("../../adapters/express-callback"));
var express_1 = require("express");
var controller_1 = require("../../modules/profile/controller");
var authentication_1 = __importDefault(require("../../middlewares/authentication"));
var is_banned_1 = __importDefault(require("../../middlewares/is-banned"));
var router = (0, express_1.Router)();
router.post('/caregivers', authentication_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.completeCaregiverProfile)()));
exports.default = router;
//# sourceMappingURL=routes.js.map
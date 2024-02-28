"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_callback_1 = __importDefault(require("../../adapters/express-callback"));
var express_1 = require("express");
var authentication_1 = __importDefault(require("../../middlewares/authentication"));
var controller_1 = require("../../modules/admins/controller");
var is_admin_1 = __importDefault(require("../../middlewares/is-admin"));
var is_banned_1 = __importDefault(require("../../middlewares/is-banned"));
var router = (0, express_1.Router)();
router.get('/', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.getAllAdmins)()));
router.get('/:id', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.getAdmin)()));
router.patch('/:id', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.updateAdmin)()));
router.patch('/:id/ban', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.banAdmin)()));
router.patch('/caregiver/:id/ban', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.banCaregiver)()));
router.patch('/patient/:id/ban', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.banPatient)()));
router.patch('/caregiver/:id/verify', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.verifyCaregiver)()));
router.patch('/patient/:id/verify', authentication_1.default, is_admin_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.verifyPatient)()));
exports.default = router;
//# sourceMappingURL=routes.js.map
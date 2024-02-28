"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_callback_1 = __importDefault(require("../../adapters/express-callback"));
var express_1 = require("express");
var controller_1 = require("../../modules/auth/controller");
var verify_refresh_token_1 = __importDefault(require("../../middlewares/verify-refresh-token"));
var router = (0, express_1.Router)();
router.post('/caregiver/signup', (0, express_callback_1.default)((0, controller_1.caregiverSignup)()));
router.post('/caregiver/signin', (0, express_callback_1.default)((0, controller_1.caregiverSignin)()));
router.post('/patient/signup', (0, express_callback_1.default)((0, controller_1.patientSignup)()));
router.post('/patient/signin', (0, express_callback_1.default)((0, controller_1.patientSignin)()));
router.post('/admin/signin', (0, express_callback_1.default)((0, controller_1.adminSignin)()));
router.post('/admin/signup', (0, express_callback_1.default)((0, controller_1.adminSignup)()));
router.delete('/accounts/deletion', (0, express_callback_1.default)((0, controller_1.deleteAccount)()));
// router.post( '/reset-password/:id', callback( passwordReset() ) )
router.get('/token/refresh', verify_refresh_token_1.default, (0, express_callback_1.default)((0, controller_1.getAccessToken)()));
exports.default = router;
//# sourceMappingURL=routes.js.map
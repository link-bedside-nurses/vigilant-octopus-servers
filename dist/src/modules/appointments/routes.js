"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_callback_1 = __importDefault(require("../../adapters/express-callback"));
var express_1 = require("express");
var controller_1 = require("../../modules/appointments/controller");
var authentication_1 = __importDefault(require("../../middlewares/authentication"));
var validate_objectid_1 = require("../../middlewares/validate-objectid");
var is_banned_1 = __importDefault(require("../../middlewares/is-banned"));
var is_admin_1 = __importDefault(require("../../middlewares/is-admin"));
var router = (0, express_1.Router)();
router.get('/', authentication_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.getAllAppointments)()));
router.post('/', authentication_1.default, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.scheduleAppointment)()));
router.get('/:id', authentication_1.default, validate_objectid_1.validateObjectID, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.getAppointment)()));
router.get('/:id/patients', authentication_1.default, validate_objectid_1.validateObjectID, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.getPatientAppointments)()));
router.get('/:id/caregivers', authentication_1.default, validate_objectid_1.validateObjectID, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.getCaregiverAppointments)()));
router.patch('/:id/confirm', authentication_1.default, validate_objectid_1.validateObjectID, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.confirmAppointment)()));
router.patch('/:id/cancel', authentication_1.default, validate_objectid_1.validateObjectID, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.cancelAppointment)()));
router.delete('/:id', authentication_1.default, is_admin_1.default, validate_objectid_1.validateObjectID, is_banned_1.default, (0, express_callback_1.default)((0, controller_1.deleteAppointment)()));
exports.default = router;
//# sourceMappingURL=routes.js.map
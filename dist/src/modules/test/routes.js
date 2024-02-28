"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_callback_1 = __importDefault(require("../../adapters/express-callback"));
var express_1 = require("express");
var controller_1 = require("../../modules/test/controller");
var router = (0, express_1.Router)();
router.get('/ping', (0, express_callback_1.default)((0, controller_1.ping)()));
router.get('/error', (0, express_callback_1.default)((0, controller_1.error)()));
exports.default = router;
//# sourceMappingURL=routes.js.map
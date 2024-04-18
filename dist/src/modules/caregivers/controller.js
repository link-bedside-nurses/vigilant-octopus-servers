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
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCaregiversByLocation = exports.deactivateCaregiver = exports.updateCaregiver = exports.deleteCaregiver = exports.getCaregiver = exports.getAllCaregivers = void 0;
var http_status_codes_1 = require("http-status-codes");
var db_1 = require("../../db");
var utils_1 = require("../../utils");
function getAllCaregivers() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var latLng, caregivers, latitude, longitude, pipeline;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        latLng = request.query.latLng;
                        caregivers = [];
                        if (!latLng) return [3 /*break*/, 2];
                        latitude = latLng === null || latLng === void 0 ? void 0 : latLng.split(",")[0];
                        longitude = latLng === null || latLng === void 0 ? void 0 : latLng.split(",")[1];
                        if (!latitude || !longitude) {
                            throw new Error("Missing either latitude or longitude on the 'latLng' query key");
                        }
                        pipeline = [
                            {
                                '$geoNear': {
                                    'near': {
                                        'type': "Point",
                                        'coordinates': [parseFloat(longitude), parseFloat(latitude)],
                                    },
                                    'distanceField': "distance",
                                },
                            },
                            {
                                '$sort': {
                                    'distance': 1,
                                },
                            },
                        ];
                        return [4 /*yield*/, db_1.db.appointments.aggregate(pipeline)];
                    case 1:
                        caregivers = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, db_1.db.caregivers
                            .find({})
                            .sort({ createdAt: "desc" })];
                    case 3:
                        caregivers = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, {
                            statusCode: http_status_codes_1.StatusCodes.OK,
                            body: {
                                data: caregivers,
                                message: "caregivers Retrieved",
                            },
                        }];
                }
            });
        });
    };
}
exports.getAllCaregivers = getAllCaregivers;
function getCaregiver() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var caregiver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.caregivers.findById(request.params.id)];
                    case 1:
                        caregiver = _a.sent();
                        if (!caregiver) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: "No caregiver Found",
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: caregiver,
                                    message: "caregiver Retrieved",
                                },
                            }];
                }
            });
        });
    };
}
exports.getCaregiver = getCaregiver;
function deleteCaregiver() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var caregiver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.caregivers.findByIdAndDelete(request.params.id)];
                    case 1:
                        caregiver = _a.sent();
                        if (!caregiver) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: "No caregiver Found",
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: caregiver,
                                    message: "caregiver deleted",
                                },
                            }];
                }
            });
        });
    };
}
exports.deleteCaregiver = deleteCaregiver;
function updateCaregiver() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var caregiver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.caregivers.findByIdAndUpdate(request.params.id, __assign({}, request.body), { new: true })];
                    case 1:
                        caregiver = _a.sent();
                        if (!caregiver) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: "No caregiver Found",
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: caregiver,
                                    message: "caregiver updated",
                                },
                            }];
                }
            });
        });
    };
}
exports.updateCaregiver = updateCaregiver;
function deactivateCaregiver() {
    return function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var caregiver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.caregivers.findByIdAndUpdate(request.params.id, { $set: { isDeactivated: true } }, { new: true })];
                    case 1:
                        caregiver = _a.sent();
                        if (!caregiver) {
                            return [2 /*return*/, {
                                    statusCode: http_status_codes_1.StatusCodes.NOT_FOUND,
                                    body: {
                                        message: "No caregiver Found",
                                        data: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: caregiver,
                                    message: "Account successfully deactivated",
                                },
                            }];
                }
            });
        });
    };
}
exports.deactivateCaregiver = deactivateCaregiver;
var locationBasedSearch = function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var coords, _a, radiusInKm, searchRadius, longitude, latitude, queryFilter, resultingCaregivers;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log(params);
                coords = params.location, _a = params.distance, radiusInKm = _a === void 0 ? 8.8 : _a;
                searchRadius = radiusInKm / 1.60934 / 3963.2;
                longitude = coords.lng;
                latitude = coords.lat;
                queryFilter = {};
                queryFilter = __assign(__assign({}, queryFilter), { location: {
                        $geoWithin: {
                            $centerSphere: [[longitude, latitude], searchRadius],
                        },
                    } });
                return [4 /*yield*/, db_1.db.caregivers.find(__assign({}, queryFilter))];
            case 1:
                resultingCaregivers = _b.sent();
                return [2 /*return*/, resultingCaregivers];
        }
    });
}); };
function searchCaregiversByLocation() {
    return function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, latitude, longitude, filter, caregivers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryParams = req.query;
                        console.log(queryParams);
                        if (!queryParams.lat || !queryParams.lng) {
                            throw new utils_1.Exception("Provide both 'lat' and 'lng' as query params");
                        }
                        latitude = parseFloat(queryParams.lat);
                        longitude = parseFloat(queryParams.lng);
                        filter = {};
                        if (queryParams.distance) {
                            filter = __assign(__assign({}, filter), { distance: parseFloat(queryParams.distance) });
                        }
                        return [4 /*yield*/, locationBasedSearch(__assign({ location: { lat: latitude, lng: longitude } }, filter))];
                    case 1:
                        caregivers = _a.sent();
                        return [2 /*return*/, {
                                statusCode: http_status_codes_1.StatusCodes.OK,
                                body: {
                                    data: caregivers || [],
                                    message: caregivers.length > 0
                                        ? "Found ".concat(caregivers.length, " result(s)")
                                        : "No results found",
                                },
                            }];
                }
            });
        });
    };
}
exports.searchCaregiversByLocation = searchCaregiversByLocation;
//# sourceMappingURL=controller.js.map
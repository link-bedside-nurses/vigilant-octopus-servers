"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpCacheStore = void 0;
var OtpCacheStore = /** @class */ (function () {
    function OtpCacheStore() {
        this.cache = new Map();
    }
    OtpCacheStore.prototype.set = function (key, value) {
        this.cache.set(key, value);
    };
    OtpCacheStore.prototype.get = function (key) {
        return this.cache.get(key);
    };
    OtpCacheStore.prototype.expire = function (key) {
        this.cache.delete(key);
    };
    OtpCacheStore.prototype.has = function (key) {
        return this.cache.has(key);
    };
    OtpCacheStore.prototype.clear = function () {
        this.cache.clear();
    };
    OtpCacheStore.prototype.keys = function () {
        return this.cache.keys();
    };
    OtpCacheStore.prototype.values = function () {
        return this.cache.values();
    };
    OtpCacheStore.prototype.entries = function () {
        return this.cache.entries();
    };
    OtpCacheStore.prototype.size = function () {
        return this.cache.size;
    };
    return OtpCacheStore;
}());
exports.otpCacheStore = new OtpCacheStore();
//# sourceMappingURL=client.js.map
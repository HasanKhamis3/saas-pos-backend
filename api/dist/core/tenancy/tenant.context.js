"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantId = getTenantId;
exports.setTenantId = setTenantId;
const async_hooks_1 = require("async_hooks");
const tenantContext = new async_hooks_1.AsyncLocalStorage();
function getTenantId() {
    return tenantContext.getStore();
}
function setTenantId(tenantId, callback) {
    tenantContext.run(tenantId, callback);
}
//# sourceMappingURL=tenant.context.js.map
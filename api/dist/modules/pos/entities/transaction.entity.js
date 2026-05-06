"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosTransaction = void 0;
const typeorm_1 = require("typeorm");
const base_tenant_entity_1 = require("../../../shared/database/base-tenant.entity");
let PosTransaction = class PosTransaction extends base_tenant_entity_1.BaseTenantEntity {
    vendorId;
    totalAmount;
    systemCommission;
    vendorPayout;
    paymentMethod;
};
exports.PosTransaction = PosTransaction;
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' }),
    __metadata("design:type", String)
], PosTransaction.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_amount', type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], PosTransaction.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_commission', type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], PosTransaction.prototype, "systemCommission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_payout', type: 'decimal', precision: 10, scale: 3 }),
    __metadata("design:type", Number)
], PosTransaction.prototype, "vendorPayout", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PosTransaction.prototype, "paymentMethod", void 0);
exports.PosTransaction = PosTransaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], PosTransaction);
//# sourceMappingURL=transaction.entity.js.map
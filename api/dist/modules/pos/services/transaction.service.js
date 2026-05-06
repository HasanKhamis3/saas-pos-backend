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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const tenant_context_1 = require("../../../core/tenancy/tenant.context");
const vendor_entity_1 = require("../../tenants/entities/vendor.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
let TransactionService = class TransactionService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async processSale(dto) {
        const tenantId = (0, tenant_context_1.getTenantId)();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('READ COMMITTED');
        try {
            const vendor = await queryRunner.manager.findOne(vendor_entity_1.Vendor, {
                where: { id: dto.vendorId, tenantId, isActive: true }
            });
            if (!vendor) {
                throw new common_1.BadRequestException('المورد غير موجود أو غير نشط حالياً');
            }
            const totalAmount = dto.totalAmount;
            const systemCommission = (totalAmount * vendor.commissionRate) / 100;
            const vendorPayout = totalAmount - systemCommission;
            const transaction = queryRunner.manager.create(transaction_entity_1.PosTransaction, {
                tenantId,
                vendorId: vendor.id,
                totalAmount,
                systemCommission: Number(systemCommission.toFixed(3)),
                vendorPayout: Number(vendorPayout.toFixed(3)),
                paymentMethod: dto.paymentMethod,
            });
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            return transaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException('فشلت عملية الدفع، يرجى المحاولة لاحقاً', error.message);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map
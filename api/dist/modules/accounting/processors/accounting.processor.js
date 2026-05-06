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
var AccountingProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let AccountingProcessor = AccountingProcessor_1 = class AccountingProcessor extends bullmq_1.WorkerHost {
    dataSource;
    logger = new common_1.Logger(AccountingProcessor_1.name);
    constructor(dataSource) {
        super();
        this.dataSource = dataSource;
    }
    async process(job) {
        switch (job.name) {
            case 'generate_z_report':
                return this.handleZReport(job.data);
            default:
                throw new Error(`نوع المهمة غير معروف: ${job.name}`);
        }
    }
    async handleZReport(data) {
        this.logger.log(`بدء تقرير Z للحاضنة: ${data.tenantId} بتاريخ ${data.date}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const summary = await queryRunner.query(`SELECT 
           vendor_id, 
           SUM(total_amount) as gross_sales, 
           SUM(system_commission) as total_commission, 
           SUM(vendor_payout) as net_payout
         FROM transactions
         WHERE tenant_id = $1 AND DATE(created_at) = $2
         GROUP BY vendor_id`, [data.tenantId, data.date]);
            for (const row of summary) {
                this.logger.log(`تسوية المورد ${row.vendor_id}: الصافي ${row.net_payout} دينار`);
            }
            return { status: 'completed', count: summary.length };
        }
        catch (error) {
            this.logger.error(`فشل تقرير الحاضنة: ${data.tenantId}`, error.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.AccountingProcessor = AccountingProcessor;
exports.AccountingProcessor = AccountingProcessor = AccountingProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('accounting-queue'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AccountingProcessor);
//# sourceMappingURL=accounting.processor.js.map
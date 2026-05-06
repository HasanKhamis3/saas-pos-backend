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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const tenant_context_1 = require("../../../core/tenancy/tenant.context");
let ReportService = class ReportService {
    accountingQueue;
    constructor(accountingQueue) {
        this.accountingQueue = accountingQueue;
    }
    async triggerEndOfDayReport(date) {
        const tenantId = (0, tenant_context_1.getTenantId)();
        const job = await this.accountingQueue.add('generate_z_report', {
            tenantId,
            date,
        });
        return {
            message: 'بدأت عملية إنشاء تقرير نهاية اليوم في الخلفية',
            jobId: job.id,
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)('accounting-queue')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], ReportService);
//# sourceMappingURL=report.service.js.map
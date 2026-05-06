import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { getTenantId } from '../../../core/tenancy/tenant.context';

@Injectable()
export class ReportService {
  constructor(
    @InjectQueue('accounting-queue') private readonly accountingQueue: Queue,
  ) {}

  async triggerEndOfDayReport(date: string) {
    const tenantId = getTenantId();

    // نرسل المهمة للـ Redis ليتم معالجتها في الخلفية
    const job = await this.accountingQueue.add('generate_z_report', {
      tenantId,
      date,
    });

    return {
      message: 'بدأت عملية إنشاء تقرير نهاية اليوم في الخلفية',
      jobId: job.id,
    };
  }
}
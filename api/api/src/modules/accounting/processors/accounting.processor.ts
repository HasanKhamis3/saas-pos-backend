import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Processor('accounting-queue')
export class AccountingProcessor extends WorkerHost {
  private readonly logger = new Logger(AccountingProcessor.name);

  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'generate_z_report':
        return this.handleZReport(job.data);
      default:
        throw new Error(`نوع المهمة غير معروف: ${job.name}`);
    }
  }

  private async handleZReport(data: { tenantId: string; date: string }) {
    this.logger.log(`بدء تقرير Z للحاضنة: ${data.tenantId} بتاريخ ${data.date}`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // استعلام SQL سريع لحساب مستحقات كل الموردين دفعة واحدة
      const summary = await queryRunner.query(
        `SELECT 
           vendor_id, 
           SUM(total_amount) as gross_sales, 
           SUM(system_commission) as total_commission, 
           SUM(vendor_payout) as net_payout
         FROM transactions
         WHERE tenant_id = $1 AND DATE(created_at) = $2
         GROUP BY vendor_id`,
        [data.tenantId, data.date]
      );

      for (const row of summary) {
        this.logger.log(`تسوية المورد ${row.vendor_id}: الصافي ${row.net_payout} دينار`);
      }

      return { status: 'completed', count: summary.length };
      
    } catch (error) {
      this.logger.error(`فشل تقرير الحاضنة: ${data.tenantId}`, (error as Error).stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
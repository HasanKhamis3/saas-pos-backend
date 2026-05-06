import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
export declare class AccountingProcessor extends WorkerHost {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    process(job: Job<any, any, string>): Promise<any>;
    private handleZReport;
}

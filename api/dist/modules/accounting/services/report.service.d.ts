import { Queue } from 'bullmq';
export declare class ReportService {
    private readonly accountingQueue;
    constructor(accountingQueue: Queue);
    triggerEndOfDayReport(date: string): Promise<{
        message: string;
        jobId: string | undefined;
    }>;
}

import { BaseTenantEntity } from '../../../shared/database/base-tenant.entity';
export declare class Vendor extends BaseTenantEntity {
    businessName: string;
    commissionRate: number;
    isActive: boolean;
}

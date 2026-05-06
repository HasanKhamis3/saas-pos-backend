import { BaseTenantEntity } from '../../../shared/database/base-tenant.entity';
export declare class PosTransaction extends BaseTenantEntity {
    vendorId: string;
    totalAmount: number;
    systemCommission: number;
    vendorPayout: number;
    paymentMethod: string;
}

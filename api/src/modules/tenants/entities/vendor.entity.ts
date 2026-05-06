import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../shared/database/base-tenant.entity';

@Entity('vendors')
export class Vendor extends BaseTenantEntity {
  @Column({ name: 'business_name', type: 'varchar', length: 255 })
  businessName: string;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  commissionRate: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
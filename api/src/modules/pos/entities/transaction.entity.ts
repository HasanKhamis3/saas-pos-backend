import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../shared/database/base-tenant.entity';

@Entity('transactions')
export class PosTransaction extends BaseTenantEntity {
  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 3 })
  totalAmount: number;

  @Column({ name: 'system_commission', type: 'decimal', precision: 10, scale: 3 })
  systemCommission: number;

  @Column({ name: 'vendor_payout', type: 'decimal', precision: 10, scale: 3 })
  vendorPayout: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  paymentMethod: string;
}
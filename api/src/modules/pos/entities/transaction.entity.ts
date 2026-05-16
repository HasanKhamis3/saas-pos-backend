import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pos_transactions')
export class PosTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  vendorId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  systemCommission!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  vendorPayout!: number;

  @Column()
  paymentMethod!: string;

  // ✅ درع الحماية الإضافي: السماح بالقيم الفارغة للفواتير القديمة
  @Column({ type: 'jsonb', nullable: true })
  items!: any;

  @Column({ default: 'completed' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pos_transactions')
export class PosTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vendorId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  systemCommission: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  vendorPayout: number;

  @Column()
  paymentMethod: string;

  // 📦 تخزين المنتجات والكميات المباعة كـ JSON داخل الفاتورة للرجوع إليها وقت الاسترجاع
  @Column('jsonb', { nullable: true })
  items: { productId: string; quantity: number }[];

  // 🔄 حالة الفاتورة: 'completed' أو 'refunded'
  @Column({ default: 'completed' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
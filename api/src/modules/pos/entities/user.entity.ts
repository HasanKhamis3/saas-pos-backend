import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// تحديد الصلاحيات المتاحة في النظام
export enum UserRole {
  MANAGER = 'manager',
  CASHIER = 'cashier',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // سنقوم بتشفيرها لاحقاً لضمان الأمان

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  role: UserRole;

  @Column()
  vendorId: string; // لربط الموظف بمتجر (تاجر) معين

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
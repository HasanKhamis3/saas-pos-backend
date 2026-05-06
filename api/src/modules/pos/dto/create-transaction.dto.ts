import { IsUUID, IsNumber, Min, IsEnum } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  vendorId: string;

  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @IsEnum(['cash', 'card', 'benefit_pay'])
  paymentMethod: 'cash' | 'card' | 'benefit_pay';
}
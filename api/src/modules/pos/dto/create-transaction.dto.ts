export class CreateTransactionDto {
  vendorId: string;
  totalAmount: number;
  paymentMethod: string;
  items?: {
    productId: string;
    quantity: number;
  }[];
}
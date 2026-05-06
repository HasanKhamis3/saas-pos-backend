export declare class CreateTransactionDto {
    vendorId: string;
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'benefit_pay';
}

export class PurchaseOrderResponseDto {
  id: string;
  poNumber: string;
  poDate: string;
  vendorId: string;
  vendorName?: string;
  propertyId: string | null;
  propertyName?: string | null;
  status: string;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

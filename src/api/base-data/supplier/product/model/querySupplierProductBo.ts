export interface QuerySupplierProductBo {
  id: string;
  supplierId: string;
  productId: string;
  skuId: string;
  supplierProductCode: string;
  supplierProductName: string;
  defaultPurchasePrice: number;
  minOrderQty: number;
  leadTimeDays: number;
  isDefault: boolean;
  available: boolean;
  description: string;
}
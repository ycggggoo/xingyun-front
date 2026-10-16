export interface CreateSupplierProductVo {
  supplierId: string;
  productId: string;
  skuId?: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  defaultPurchasePrice?: number;
  minOrderQty?: number;
  leadTimeDays?: number;
  isDefault: boolean;
  description?: string;
}
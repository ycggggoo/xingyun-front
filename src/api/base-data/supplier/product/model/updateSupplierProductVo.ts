export interface UpdateSupplierProductVo {
  id: string;
  supplierProductCode?: string;
  supplierProductName?: string;
  defaultPurchasePrice?: number;
  minOrderQty?: number;
  leadTimeDays?: number;
  isDefault: boolean;
  description?: string;
}
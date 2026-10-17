export interface ProductSupplierBo {
  id: string;
  code: string;
  name: string;
  suppliers: { id: string; name: string }[];
}

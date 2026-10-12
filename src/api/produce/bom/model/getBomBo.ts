export interface BomDetailBo {
  id: string;
  bomId: string;
  productId: string;
  skuId: string;
  skuCode: string;
  productCode: string;
  productName: string;
  productSpec: string;
  productUnit: string;
  unitNum: number;
  scrapRate: number;
  isKeyMaterial: boolean;
  sortOrder: number;
  description: string;
}

export interface GetBomBo {
  id: string;
  code: string;
  name: string;
  mainProductId: string;
  mainSkuId: string;
  mainSkuCode: string;
  mainProductCode: string;
  mainProductName: string;
  outputNum: number;
  scrapRate: number;
  status: number;
  statusDesc: string;
  isDefault: boolean;
  version: string;
  description: string;
  approveBy: string;
  approveTime: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  details: BomDetailBo[];
}

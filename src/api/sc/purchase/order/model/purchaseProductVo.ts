export interface PurchaseProductVo {
  /**
   * 商品ID
   */
  productId: string;

  /**
   * SKU ID
   */
  skuId: string;

  /** 原采购订单明细ID，修改时用于保留历史税率；新增行传空字符串 */
  purchaseOrderDetailId?: string;

  /** 页面计算含税价所用税率，保存时由服务端核对 */
  taxRate?: number;

  /**
   * 采购价
   */
  purchasePrice: number;

  /**
   * 采购数量
   */
  purchaseNum: number;

  /**
   * 备注
   */
  description: string;
}

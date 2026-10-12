export interface BomDetailVo {
  /**
   * 明细ID（修改时回传）
   */
  id?: string;

  /**
   * 子件商品ID
   */
  productId: string;

  /**
   * 子件SKU ID
   */
  skuId: string;

  /**
   * 单位用量
   */
  unitNum: number;

  /**
   * 损耗率%
   */
  scrapRate?: number;

  /**
   * 是否关键物料
   */
  isKeyMaterial?: boolean;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 备注
   */
  description?: string;
}

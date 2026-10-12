export interface AssembleProductVo {
  /**
   * 子件商品ID
   */
  productId: string;

  /**
   * 子件SKU ID
   */
  skuId: string;

  /**
   * 子件SKU编号（前端展示）
   */
  skuCode?: string;

  /**
   * 子件商品编号（前端展示）
   */
  productCode?: string;

  /**
   * 子件商品名称（前端展示）
   */
  productName?: string;

  /**
   * 规格（前端展示）
   */
  productSpec?: string;

  /**
   * 单位（前端展示）
   */
  productUnit?: string;

  /**
   * 单位用量（自BOM带出）
   */
  num: number;

  /**
   * 本次消耗数量
   */
  stockNum: number;

  /**
   * 备注
   */
  description?: string;
}

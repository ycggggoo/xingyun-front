export interface QueryBomVo {
  /**
   * BOM编号
   */
  code?: string;

  /**
   * BOM名称
   */
  name?: string;

  /**
   * 成品商品（编号/名称模糊）
   */
  mainProduct?: string;

  /**
   * 状态 0-草稿 1-启用 2-停用
   */
  status?: number;
}

export interface QueryAssembleSheetVo {
  /**
   * 单据号
   */
  code?: string;

  /**
   * 仓库ID
   */
  scId?: string;

  /**
   * 成品商品（编号/名称模糊）
   */
  product?: string;

  /**
   * 状态 0-待审核 3-审核通过 6-审核拒绝
   */
  status?: number;

  /**
   * 创建时间 起
   */
  createTimeStart?: string;

  /**
   * 创建时间 止
   */
  createTimeEnd?: string;
}

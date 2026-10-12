import { AssembleProductVo } from './assembleProductVo';

export interface CreateAssembleSheetVo {
  /**
   * 仓库ID
   */
  scId: string;

  /**
   * BOM ID
   */
  bomId: string;

  /**
   * 组装数量（成品数量）
   */
  totalNum: number;

  /**
   * 备注
   */
  description?: string;

  /**
   * 子件明细
   */
  products: AssembleProductVo[];
}

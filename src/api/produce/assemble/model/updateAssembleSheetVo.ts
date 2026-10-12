import { CreateAssembleSheetVo } from './createAssembleSheetVo';

export interface UpdateAssembleSheetVo extends CreateAssembleSheetVo {
  /**
   * 组装单ID
   */
  id: string;
}

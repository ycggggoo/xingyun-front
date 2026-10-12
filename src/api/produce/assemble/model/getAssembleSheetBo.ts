import { AssembleSheetDetailBo } from './assembleSheetDetailBo';

export interface GetAssembleSheetBo {
  id: string;
  code: string;
  scId: string;
  scName: string;
  bomId: string;
  productId: string;
  skuId: string;
  skuCode: string;
  productCode: string;
  productName: string;
  totalNum: number;
  status: number;
  statusDesc: string;
  description: string;
  refuseReason: string;
  approveBy: string;
  approveTime: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  details: AssembleSheetDetailBo[];
}

import { BomDetailVo } from './bomDetailVo';

export interface UpdateBomVo {
  id: string;
  code: string;
  name: string;
  mainProductId: string;
  mainSkuId: string;
  outputNum: number;
  scrapRate?: number;
  isDefault?: boolean;
  version?: string;
  description?: string;
  details: BomDetailVo[];
}

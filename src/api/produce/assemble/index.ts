import { defHttp } from '/@/utils/http/axios';
import { PageResult } from '@/api/model/pageResult';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { QueryAssembleSheetVo } from '@/api/produce/assemble/model/queryAssembleSheetVo';
import { QueryAssembleSheetBo } from '@/api/produce/assemble/model/queryAssembleSheetBo';
import { GetAssembleSheetBo } from '@/api/produce/assemble/model/getAssembleSheetBo';
import { CreateAssembleSheetVo } from '@/api/produce/assemble/model/createAssembleSheetVo';
import { UpdateAssembleSheetVo } from '@/api/produce/assemble/model/updateAssembleSheetVo';
import { ApprovePassAssembleSheetVo } from '@/api/produce/assemble/model/approvePassAssembleSheetVo';
import { ApproveRefuseAssembleSheetVo } from '@/api/produce/assemble/model/approveRefuseAssembleSheetVo';
import { AssembleShortageBo } from '@/api/produce/assemble/model/assembleShortageBo';

const baseUrl = '/produce/assemble';
const region = 'cloud-api';

/**
 * 查询列表
 */
export function query(
  params: QueryAssembleSheetVo,
): Promise<PageResult<QueryAssembleSheetBo>> {
  return defHttp.get<PageResult<QueryAssembleSheetBo>>(
    {
      url: baseUrl + '/query',
      params,
    },
    {
      region,
    },
  );
}

/**
 * 根据ID查询详情
 */
export function getDetail(id: string): Promise<GetAssembleSheetBo> {
  return defHttp.get<GetAssembleSheetBo>(
    {
      url: baseUrl,
      params: { id },
    },
    {
      region,
    },
  );
}

/**
 * 缺料计算
 */
export function calcShortage(params: {
  bomId: string;
  totalNum: number;
  scId: string;
}): Promise<AssembleShortageBo[]> {
  return defHttp.get<AssembleShortageBo[]>(
    {
      url: baseUrl + '/calc',
      params,
    },
    {
      region,
    },
  );
}

/**
 * 新增
 */
export function create(data: CreateAssembleSheetVo): Promise<void> {
  return defHttp.post<void>(
    {
      url: baseUrl,
      data,
    },
    {
      contentType: ContentTypeEnum.JSON,
      region,
    },
  );
}

/**
 * 修改
 */
export function update(data: UpdateAssembleSheetVo): Promise<void> {
  return defHttp.put<void>(
    {
      url: baseUrl,
      data,
    },
    {
      contentType: ContentTypeEnum.JSON,
      region,
    },
  );
}

/**
 * 审核通过
 */
export function approvePass(data: ApprovePassAssembleSheetVo): Promise<void> {
  return defHttp.patch<void>(
    {
      url: baseUrl + '/approve/pass',
      data,
    },
    {
      contentType: ContentTypeEnum.JSON,
      region,
    },
  );
}

/**
 * 批量审核通过
 */
export function batchApprovePass(
  data: ApprovePassAssembleSheetVo,
  showError: boolean = false,
): Promise<void> {
  return defHttp.patch<void>(
    {
      url: baseUrl + '/approve/pass',
      data,
    },
    {
      hiddenError: !showError,
      contentType: ContentTypeEnum.JSON,
      region,
    },
  );
}

/**
 * 直接审核通过
 */
export function directApprovePass(data: CreateAssembleSheetVo): Promise<void> {
  return defHttp.post<void>(
    {
      url: baseUrl + '/approve/pass/direct',
      data,
    },
    {
      contentType: ContentTypeEnum.JSON,
      region,
    },
  );
}

/**
 * 审核拒绝
 */
export function approveRefuse(data: ApproveRefuseAssembleSheetVo): Promise<void> {
  return defHttp.patch<void>(
    {
      url: baseUrl + '/approve/refuse',
      data,
    },
    {
      contentType: ContentTypeEnum.JSON,
      region,
    },
  );
}

/**
 * 删除
 */
export function deleteById(id: string): Promise<void> {
  return defHttp.delete<void>(
    {
      url: baseUrl,
      data: { id },
    },
    {
      contentType: ContentTypeEnum.FORM_URLENCODED,
      region,
    },
  );
}

/**
 * 批量删除
 */
export function batchDelete(id: string, showError: boolean = false): Promise<void> {
  return defHttp.delete<void>(
    {
      url: baseUrl,
      data: { id },
    },
    {
      hiddenError: !showError,
      contentType: ContentTypeEnum.FORM_URLENCODED,
      region,
    },
  );
}

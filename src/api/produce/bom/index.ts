import { defHttp } from '/@/utils/http/axios';
import { PageResult } from '@/api/model/pageResult';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { QueryBomVo } from '@/api/produce/bom/model/queryBomVo';
import { QueryBomBo } from '@/api/produce/bom/model/queryBomBo';
import { GetBomBo } from '@/api/produce/bom/model/getBomBo';
import { CreateBomVo } from '@/api/produce/bom/model/createBomVo';
import { UpdateBomVo } from '@/api/produce/bom/model/updateBomVo';

const baseUrl = '/produce/bom';
const region = 'cloud-api';

/**
 * 查询列表
 */
export function query(params: QueryBomVo): Promise<PageResult<QueryBomBo>> {
  return defHttp.get<PageResult<QueryBomBo>>(
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
 * 根据ID查询
 */
export function get(id: string): Promise<GetBomBo> {
  return defHttp.get<GetBomBo>(
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
 * 新增
 */
export function create(data: CreateBomVo): Promise<void> {
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
export function update(data: UpdateBomVo): Promise<void> {
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
 * 审核启用
 */
export function approve(id: string): Promise<void> {
  return defHttp.post<void>(
    {
      url: baseUrl + '/approve',
      data: { id },
    },
    {
      contentType: ContentTypeEnum.FORM_URLENCODED,
      region,
    },
  );
}

/**
 * 停用
 */
export function disable(id: string): Promise<void> {
  return defHttp.post<void>(
    {
      url: baseUrl + '/disable',
      data: { id },
    },
    {
      contentType: ContentTypeEnum.FORM_URLENCODED,
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

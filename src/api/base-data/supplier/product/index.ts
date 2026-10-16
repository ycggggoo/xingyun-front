import { defHttp } from '/@/utils/http/axios';
import { PageResult } from '@/api/model/pageResult';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { QuerySupplierProductVo } from '@/api/base-data/supplier/product/model/querySupplierProductVo';
import { QuerySupplierProductBo } from '@/api/base-data/supplier/product/model/querySupplierProductBo';
import { GetSupplierProductBo } from '@/api/base-data/supplier/product/model/getSupplierProductBo';
import { CreateSupplierProductVo } from '@/api/base-data/supplier/product/model/createSupplierProductVo';
import { UpdateSupplierProductVo } from '@/api/base-data/supplier/product/model/updateSupplierProductVo';

const baseUrl = '/basedata/supplier/product';
const region = 'cloud-api';

export function query(params: QuerySupplierProductVo): Promise<PageResult<QuerySupplierProductBo>> {
  return defHttp.get<PageResult<QuerySupplierProductBo>>(
    { url: baseUrl + '/query', params },
    { region },
  );
}

export function get(id: string): Promise<GetSupplierProductBo> {
  return defHttp.get<GetSupplierProductBo>({ url: baseUrl, params: { id } }, { region });
}

export function listBySupplier(supplierId: string): Promise<QuerySupplierProductBo[]> {
  return defHttp.get<QuerySupplierProductBo[]>(
    { url: baseUrl + '/by-supplier', params: { supplierId } },
    { region },
  );
}

export function listByProduct(productId: string): Promise<QuerySupplierProductBo[]> {
  return defHttp.get<QuerySupplierProductBo[]>(
    { url: baseUrl + '/by-product', params: { productId } },
    { region },
  );
}

export function create(data: CreateSupplierProductVo): Promise<void> {
  return defHttp.post<void>(
    { url: baseUrl, data },
    { contentType: ContentTypeEnum.FORM_URLENCODED, region },
  );
}

export function update(data: UpdateSupplierProductVo): Promise<void> {
  return defHttp.put<void>(
    { url: baseUrl, data },
    { contentType: ContentTypeEnum.FORM_URLENCODED, region },
  );
}

export function deleteById(id: string): Promise<void> {
  return defHttp.delete<void>(
    { url: baseUrl, data: { id } },
    { contentType: ContentTypeEnum.FORM_URLENCODED, region },
  );
}
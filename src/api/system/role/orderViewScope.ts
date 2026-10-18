import { defHttp } from '/@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';
import { SysRoleMenuSettingVo } from '@/api/system/role-menu/model/sysRoleMenuSettingVo';

const url = '/order/view-scope/role';
const region = 'cloud-api';

export interface OrderViewScopes {
  purchaseScope: number | null;
  saleScope: number | null;
}

export function getScopes(roleId: string): Promise<OrderViewScopes> {
  return defHttp.get<OrderViewScopes>({ url: url + '/scopes', params: { roleId } }, { region });
}

export function authorize(data: SysRoleMenuSettingVo & OrderViewScopes): Promise<void> {
  return defHttp.post<void>(
    { url: url + '/authorize', data },
    { region, contentType: ContentTypeEnum.JSON },
  );
}

export function get(roleId: string): Promise<number> {
  return defHttp.get<number>({ url, params: { roleId } }, { region });
}

export function save(roleId: string, scope: number): Promise<void> {
  return defHttp.put<void>(
    { url, data: { roleId, scope } },
    { region, contentType: ContentTypeEnum.JSON },
  );
}

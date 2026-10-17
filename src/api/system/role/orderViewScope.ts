import { defHttp } from '/@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';

const url = '/order/view-scope/role';
const region = 'cloud-api';

export function get(roleId: string): Promise<number> {
  return defHttp.get<number>({ url, params: { roleId } }, { region });
}

export function save(roleId: string, scope: number): Promise<void> {
  return defHttp.put<void>(
    { url, data: { roleId, scope } },
    { region, contentType: ContentTypeEnum.JSON },
  );
}

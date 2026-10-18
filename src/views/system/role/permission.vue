<template>
  <a-modal
    v-model:open="visible"
    :mask-closable="false"
    :closable="!loading"
    :keyboard="!loading"
    width="90%"
    title="授权"
    :style="{ top: '20px', maxWidth: '1400px' }"
  >
    <div v-if="visible" v-permission="['system:role:permission']" v-loading="loading">
      <vxe-grid
        ref="grid"
        resizable
        show-overflow
        highlight-hover-row
        keep-source
        row-id="id"
        :max-height="$vh * 65"
        :tree-config="{
          expandAll: true,
        }"
        :export-config="{}"
        :data="tableData"
        :checkbox-config="{
          trigger: 'row',
          checkRowKeys: selectedRows,
          checkStrictly: true,
          range: true,
          highlight: true,
          visibleMethod: ({ row }) => !row.orderScopeGroup,
          checkMethod: ({ row }) => !row.orderScopeGroup,
        }"
        :columns="tableColumn"
        @checkbox-change="updateSelectedRows"
        @checkbox-all="updateSelectedRows"
      >
        <template #title_default="{ row }">
          <span>{{ row.title }}</span>
          <div v-if="scopeKey(row)" class="order-scope" @click.stop @mousedown.stop>
            <span :id="'scope-label-' + row.id">查看范围：</span>
            <a-radio-group
              v-model:value="scopes[scopeKey(row)]"
              :aria-labelledby="'scope-label-' + row.id"
              :disabled="loading || !selectedRows.includes(row.id)"
            >
              <a-radio v-if="ids.length > 1" :value="null">保持各角色原设置</a-radio>
              <a-radio :value="0">本人及下级部门</a-radio>
              <a-radio :value="1">本人</a-radio>
              <a-radio :value="2">本部门</a-radio>
              <a-radio :value="3">全部</a-radio>
            </a-radio-group>
          </div>
        </template>
        <!-- 类型 列自定义内容 -->
        <template #menuDisplay_default="{ row }">
          <menu-display-tag :menu-display="row.display" />
        </template>

        <!-- 状态 列自定义内容 -->
        <template #available_default="{ row }">
          <available-tag :available="row.available" />
        </template>
      </vxe-grid>
    </div>

    <template #footer>
      <div class="form-modal-footer">
        <a-space>
          <a-button type="primary" :loading="loading" :disabled="!loaded" @click="submit"
            >保存</a-button
          >
          <a-button :loading="loading" @click="closeDialog">取消</a-button>
        </a-space>
      </div>
    </template>
  </a-modal>
</template>
<script>
  import { defineComponent } from 'vue';
  import * as api from '@/api/system/role-menu';
  import * as scopeApi from '@/api/system/role/orderViewScope';
  import { isEmpty, toArrayTree, eachTree, union } from '@/utils/utils';
  import { createSuccess } from '@/hooks/web/msg';
  import AvailableTag from '@/components/Tag/AvailableTag.vue';
  import MenuDisplayTag from '@/components/Tag/MenuDisplayTag.vue';

  export default defineComponent({
    // 使用组件
    components: {
      AvailableTag,
      MenuDisplayTag,
    },

    props: {
      ids: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        // 是否可见
        visible: false,
        // 是否显示加载框
        loading: false,
        loaded: false,
        requestId: 0,
        scopes: { purchaseScope: null, saleScope: null },
        // 表格数据
        tableData: [],
        selectedRows: [],
        // 表格列配置
        tableColumn: [
          { type: 'checkbox', width: 45 },
          { field: 'code', title: '编号', width: 100 },
          {
            field: 'title',
            title: '标题',
            treeNode: true,
            minWidth: 360,
            showOverflow: false,
            slots: { default: 'title_default' },
          },
          { field: 'display', title: '类型', width: 80, slots: { default: 'menuDisplay_default' } },
          { field: 'permission', title: '权限', width: 220 },
          { field: 'available', title: '状态', width: 80, slots: { default: 'available_default' } },
        ],
      };
    },
    created() {},
    methods: {
      // 打开对话框 由父页面触发
      openDialog() {
        this.visible = true;

        return this.open();
      },
      // 关闭对话框
      closeDialog() {
        this.visible = false;
        this.requestId++;
        this.$emit('close');
      },
      // 页面显示时触发
      open() {
        // 查询数据
        this.tableData = [];
        this.selectedRows = [];
        this.loaded = false;
        this.scopes = { purchaseScope: null, saleScope: null };
        return this.query();
      },
      // 列表查询数据
      async query() {
        this.loading = true;
        const requestId = ++this.requestId;
        const roleId = this.ids.length === 1 ? this.ids[0] : undefined;
        try {
          const [menus, scopes] = await Promise.all([
            api.menus(roleId),
            roleId
              ? scopeApi.getScopes(roleId)
              : Promise.resolve({ purchaseScope: null, saleScope: null }),
          ]);
          if (!this.visible || requestId !== this.requestId) return;
          // 将带层级的列表转成树结构
          const res = toArrayTree(this.buildAuthorizationRows(menus), {
            key: 'id',
            parentKey: 'parentId',
            children: 'children',
            strict: true,
          });

          this.tableData = res;

          const selectedMenus = [];
          eachTree(res, (item) => {
            if (item.selected) {
              selectedMenus.push(item.id);
            }
          });

          this.selectedRows = selectedMenus;
          this.scopes = scopes;
          this.loaded = true;
        } finally {
          if (requestId === this.requestId) this.loading = false;
        }
      },
      scopeKey(row) {
        if (row.orderScopeGroup) return;
        return {
          'purchase:order:query': 'purchaseScope',
          'sale:order:query': 'saleScope',
        }[row.permission];
      },
      buildAuthorizationRows(menus) {
        const rows = [];
        menus.forEach((row) => {
          if (row.display !== 1 || !this.scopeKey(row)) {
            rows.push(row);
            return;
          }
          rows.push({ ...row, permission: '', selected: false, orderScopeGroup: true });
          rows.push({
            ...row,
            id: `order_query_${row.id}`,
            parentId: row.id,
            code: '',
            title: row.permission === 'purchase:order:query' ? '查看采购订单' : '查看销售订单',
            display: 2,
            scopeMenuId: row.id,
          });
        });
        return rows;
      },
      async updateSelectedRows({ row, checked } = {}) {
        if (row) {
          const nodes = new Map();
          eachTree(this.tableData, (item) => nodes.set(item.id, item));
          let parent = nodes.get(row.parentId);
          while (parent && !parent.orderScopeGroup) parent = nodes.get(parent.parentId);
          if (parent) {
            const query = parent.children.find((item) => item.scopeMenuId);
            // 原菜单的操作授权会自动包含查询；在界面上同步展示这项依赖。
            if (checked) {
              await this.$refs.grid.setCheckboxRow(query, true);
            } else if (row.scopeMenuId) {
              const children = [];
              eachTree(parent.children, (item) => children.push(item));
              await this.$refs.grid.setCheckboxRow(children, false);
            }
          }
        }
        this.selectedRows = this.$refs.grid.getCheckboxRecords(true).map((item) => item.id);
      },
      // 提交数据
      submit() {
        if (this.loading || !this.loaded) return;
        this.loading = true;
        const records = union(
          this.$refs.grid.getCheckboxRecords(true),
          this.$refs.grid.getCheckboxIndeterminateRecords(true),
        );
        const menuIds = isEmpty(records)
          ? []
          : [...new Set(records.map((item) => item.scopeMenuId || item.id))];
        const scopes = { purchaseScope: null, saleScope: null };
        records.forEach((item) => {
          const key = this.scopeKey(item);
          if (key) scopes[key] = this.scopes[key];
        });
        return scopeApi
          .authorize({
            roleIds: this.ids,
            menuIds: menuIds,
            ...scopes,
          })
          .then(() => {
            createSuccess('授权成功！');
            this.$emit('confirm');
            this.visible = false;
          })
          .finally(() => {
            this.loading = false;
          });
      },
    },
  });
</script>

<style scoped>
  .order-scope {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px;
    margin-top: 8px;
    white-space: normal;
  }
</style>

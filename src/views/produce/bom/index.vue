<template>
  <div v-permission="['produce:bom:query']">
    <page-wrapper content-full-height fixed-height>
      <vxe-grid
        id="ProduceBom"
        ref="grid"
        resizable
        show-overflow
        highlight-hover-row
        keep-source
        row-id="id"
        :proxy-config="proxyConfig"
        :columns="tableColumn"
        :toolbar-config="toolbarConfig"
        :custom-config="{}"
        :pager-config="{}"
        :loading="loading"
        height="auto"
      >
        <template #form>
          <j-border>
            <j-form bordered label-width="80px" @collapse="$refs.grid.refreshColumn()">
              <j-form-item label="BOM编号">
                <a-input v-model:value="searchFormData.code" allow-clear />
              </j-form-item>
              <j-form-item label="BOM名称">
                <a-input v-model:value="searchFormData.name" allow-clear />
              </j-form-item>
              <j-form-item label="成品商品">
                <a-input
                  v-model:value="searchFormData.mainProduct"
                  placeholder="编号/名称"
                  allow-clear
                />
              </j-form-item>
              <j-form-item label="状态">
                <a-select v-model:value="searchFormData.status" placeholder="全部" allow-clear>
                  <a-select-option :value="0">草稿</a-select-option>
                  <a-select-option :value="1">启用</a-select-option>
                  <a-select-option :value="2">停用</a-select-option>
                </a-select>
              </j-form-item>
            </j-form>
          </j-border>
        </template>

        <template #toolbar_buttons>
          <a-space>
            <a-button type="primary" :icon="h(SearchOutlined)" @click="search">查询</a-button>
            <a-button
              v-permission="['produce:bom:add']"
              type="primary"
              :icon="h(PlusOutlined)"
              @click="goAdd"
              >新增</a-button
            >
          </a-space>
        </template>

        <template #status_default="{ row }">
          <a-tag v-if="row.status === 0" color="default">{{ row.statusDesc }}</a-tag>
          <a-tag v-else-if="row.status === 1" color="success">{{ row.statusDesc }}</a-tag>
          <a-tag v-else-if="row.status === 2" color="warning">{{ row.statusDesc }}</a-tag>
        </template>

        <template #isDefault_default="{ row }">
          <a-tag v-if="row.isDefault" color="blue">默认</a-tag>
          <span v-else>-</span>
        </template>

        <template #action_default="{ row }">
          <table-action outside :actions="createActions(row)" />
        </template>
      </vxe-grid>
    </page-wrapper>

    <!-- 查看窗口 -->
    <detail :id="id" ref="viewDialog" />
  </div>
</template>

<script>
  import { h, defineComponent } from 'vue';
  import Detail from './detail.vue';
  import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import * as api from '@/api/produce/bom';
  import { buildSortPageVo, isEmpty } from '@/utils/utils';
  import { createSuccess, createError, createConfirm } from '@/hooks/web/msg';
  import { usePermission } from '@/hooks/web/usePermission';
  import { multiplePageMix } from '@/mixins/multiplePageMix';

  export default defineComponent({
    name: 'ProduceBom',
    components: { Detail },
    mixins: [multiplePageMix],
    setup() {
      const { hasPermission } = usePermission();
      return {
        h,
        SearchOutlined,
        PlusOutlined,
        hasPermission,
      };
    },
    data() {
      return {
        loading: false,
        id: '',
        searchFormData: {},
        toolbarConfig: {
          slots: { buttons: 'toolbar_buttons' },
        },
        tableColumn: [
          { field: 'code', title: 'BOM编号', width: 150, sortable: true },
          { field: 'name', title: 'BOM名称', minWidth: 160 },
          { field: 'mainSkuCode', title: '成品SKU', width: 120 },
          { field: 'mainProductCode', title: '成品编号', width: 120 },
          { field: 'mainProductName', title: '成品名称', minWidth: 160 },
          { field: 'outputNum', title: '产出数量', width: 100 },
          { field: 'version', title: '版本', width: 80 },
          { field: 'isDefault', title: '默认', width: 70, slots: { default: 'isDefault_default' } },
          { field: 'status', title: '状态', width: 90, slots: { default: 'status_default' } },
          { field: 'description', title: '备注', minWidth: 160 },
          { field: 'createTime', title: '创建时间', width: 160, sortable: true },
          { title: '操作', width: 200, fixed: 'right', slots: { default: 'action_default' } },
        ],
        proxyConfig: {
          response: {
            result: 'datas',
            total: 'totalCount',
          },
          ajax: {
            query: ({ page, sorts }) => {
              return api.query(this.buildQueryParams(page, sorts));
            },
          },
        },
      };
    },
    methods: {
      search() {
        this.$refs.grid.commitProxy('reload');
      },
      buildQueryParams(page, sorts) {
        return {
          ...buildSortPageVo(page, sorts),
          ...this.searchFormData,
        };
      },
      goAdd() {
        this.openChildPage('/produce/bom/add');
      },
      goModify(id) {
        this.openChildPage('/produce/bom/modify/' + id);
      },
      doApprove(row) {
        createConfirm('是否确定审核启用该BOM？').then(() => {
          api.approve(row.id).then(() => {
            createSuccess('审核成功！');
            this.search();
          });
        });
      },
      doDisable(row) {
        createConfirm('是否确定停用该BOM？').then(() => {
          api.disable(row.id).then(() => {
            createSuccess('停用成功！');
            this.search();
          });
        });
      },
      doDelete(row) {
        createConfirm('是否确定删除该BOM？').then(() => {
          api.deleteById(row.id).then(() => {
            createSuccess('删除成功！');
            this.search();
          });
        });
      },
      createActions(row) {
        const actions = [
          {
            label: '查看',
            onClick: () => {
              this.id = row.id;
              this.$nextTick(() => this.$refs.viewDialog.openDialog());
            },
          },
        ];

        if (row.status === 0) {
          if (this.hasPermission('produce:bom:modify')) {
            actions.push({
              label: '修改',
              onClick: () => this.goModify(row.id),
            });
          }
          if (this.hasPermission('produce:bom:approve')) {
            actions.push({
              label: '审核',
              onClick: () => this.doApprove(row),
            });
          }
          if (this.hasPermission('produce:bom:delete')) {
            actions.push({
              label: '删除',
              danger: true,
              onClick: () => this.doDelete(row),
            });
          }
        } else if (row.status === 1) {
          if (this.hasPermission('produce:bom:disable')) {
            actions.push({
              label: '停用',
              danger: true,
              onClick: () => this.doDisable(row),
            });
          }
        }

        return actions;
      },
    },
  });
</script>

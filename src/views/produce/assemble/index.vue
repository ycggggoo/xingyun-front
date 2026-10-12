<template>
  <div v-permission="['produce:assemble:query']">
    <page-wrapper content-full-height fixed-height>
      <vxe-grid
        id="ProduceAssembleSheet"
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
              <j-form-item label="单号">
                <a-input v-model:value="searchFormData.code" allow-clear />
              </j-form-item>
              <j-form-item label="仓库">
                <store-center-selector v-model:value="searchFormData.scId" />
              </j-form-item>
              <j-form-item label="成品商品">
                <a-input
                  v-model:value="searchFormData.product"
                  placeholder="编号/名称"
                  allow-clear
                />
              </j-form-item>
              <j-form-item label="状态">
                <a-select v-model:value="searchFormData.status" placeholder="全部" allow-clear>
                  <a-select-option :value="0">待审核</a-select-option>
                  <a-select-option :value="3">审核通过</a-select-option>
                  <a-select-option :value="6">审核拒绝</a-select-option>
                </a-select>
              </j-form-item>
              <j-form-item label="创建时间">
                <a-range-picker
                  v-model:value="createTimeRange"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  show-time
                />
              </j-form-item>
            </j-form>
          </j-border>
        </template>

        <template #toolbar_buttons>
          <a-space>
            <a-button type="primary" :icon="h(SearchOutlined)" @click="search">查询</a-button>
            <a-button
              v-permission="['produce:assemble:add']"
              type="primary"
              :icon="h(PlusOutlined)"
              @click="goAdd"
              >新增</a-button
            >
          </a-space>
        </template>

        <template #status_default="{ row }">
          <a-tag v-if="row.status === 0" color="default">{{ row.statusDesc }}</a-tag>
          <a-tag v-else-if="row.status === 3" color="success">{{ row.statusDesc }}</a-tag>
          <a-tag v-else-if="row.status === 6" color="error">{{ row.statusDesc }}</a-tag>
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
  import StoreCenterSelector from '@/components/Selector/StoreCenterSelector.vue';
  import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import * as api from '@/api/produce/assemble';
  import { buildSortPageVo } from '@/utils/utils';
  import { createSuccess, createConfirm } from '@/hooks/web/msg';
  import { usePermission } from '@/hooks/web/usePermission';
  import { multiplePageMix } from '@/mixins/multiplePageMix';

  export default defineComponent({
    name: 'ProduceAssembleSheet',
    components: { Detail, StoreCenterSelector },
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
        createTimeRange: [],
        toolbarConfig: {
          slots: { buttons: 'toolbar_buttons' },
        },
        tableColumn: [
          { field: 'code', title: '单号', width: 170, sortable: true },
          { field: 'scName', title: '仓库', width: 120 },
          { field: 'skuCode', title: '成品SKU', width: 120 },
          { field: 'productCode', title: '成品编号', width: 120 },
          { field: 'productName', title: '成品名称', minWidth: 160 },
          { field: 'totalNum', title: '组装数量', width: 100 },
          { field: 'status', title: '状态', width: 90, slots: { default: 'status_default' } },
          { field: 'description', title: '备注', minWidth: 140 },
          { field: 'createBy', title: '创建人', width: 100 },
          { field: 'createTime', title: '创建时间', width: 160, sortable: true },
          { field: 'approveBy', title: '审核人', width: 100 },
          { field: 'approveTime', title: '审核时间', width: 160 },
          { title: '操作', width: 210, fixed: 'right', slots: { default: 'action_default' } },
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
        const params = {
          ...buildSortPageVo(page, sorts),
          ...this.searchFormData,
        };
        if (this.createTimeRange && this.createTimeRange.length === 2) {
          params.createTimeStart = this.createTimeRange[0];
          params.createTimeEnd = this.createTimeRange[1];
        }
        return params;
      },
      goAdd() {
        this.openChildPage('/produce/assemble/add');
      },
      goModify(id) {
        this.openChildPage('/produce/assemble/modify/' + id);
      },
      goApprove(id) {
        this.openChildPage('/produce/assemble/approve/' + id);
      },
      doDelete(row) {
        createConfirm('是否确定删除该组装单？').then(() => {
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

        if (row.status === 0 || row.status === 6) {
          if (this.hasPermission('produce:assemble:modify')) {
            actions.push({
              label: '修改',
              onClick: () => this.goModify(row.id),
            });
          }
          if (this.hasPermission('produce:assemble:approve')) {
            actions.push({
              label: '审核',
              onClick: () => this.goApprove(row.id),
            });
          }
          if (this.hasPermission('produce:assemble:delete')) {
            actions.push({
              label: '删除',
              danger: true,
              onClick: () => this.doDelete(row),
            });
          }
        }

        return actions;
      },
    },
  });
</script>

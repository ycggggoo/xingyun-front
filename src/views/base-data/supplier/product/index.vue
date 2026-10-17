<template>
  <div v-permission="['base-data:supplier:product:query']">
    <page-wrapper content-full-height fixed-height>
      <vxe-grid
        ref="grid"
        resizable
        show-overflow
        highlight-hover-row
        row-id="id"
        :columns="tableColumn"
        :proxy-config="proxyConfig"
        :toolbar-config="toolbarConfig"
        :pager-config="{}"
        height="auto"
      >
        <template #form>
          <j-border>
            <j-form bordered @collapse="$refs.grid.refreshColumn()">
              <j-form-item label="商品编号">
                <a-input
                  v-model:value.trim="searchFormData.code"
                  allow-clear
                  @press-enter="search"
                />
              </j-form-item>
              <j-form-item label="商品名称">
                <a-input
                  v-model:value.trim="searchFormData.name"
                  allow-clear
                  @press-enter="search"
                />
              </j-form-item>
            </j-form>
          </j-border>
        </template>
        <template #toolbar_buttons>
          <a-space wrap>
            <a-button type="primary" @click="search">查询</a-button>
            <span>维护供应商关联：</span>
            <supplier-selector
              v-model:value="supplierId"
              aria-label="维护关联的供应商"
              placeholder="请选择供应商"
              style="width: 240px"
              @input-label="supplierName = $event || ''"
            />
            <a-button :disabled="!supplierId" @click="openManager">管理关联商品</a-button>
          </a-space>
        </template>
        <template #suppliers="{ row }">
          <span v-if="row.suppliers && row.suppliers.length">
            {{ row.suppliers.map((supplier) => supplier.name).join('、') }}
          </span>
          <a-tag v-else>未关联</a-tag>
        </template>
        <template #empty>暂无商品，请先在商品信息中录入商品，或调整查询条件。</template>
      </vxe-grid>
    </page-wrapper>
    <supplier-product-manager
      ref="manager"
      :supplier-id="supplierId"
      :supplier-name="supplierName"
      @confirm="refresh"
      @close="refresh"
    />
  </div>
</template>

<script>
  import { defineComponent } from 'vue';
  import SupplierSelector from '@/components/Selector/SupplierSelector.vue';
  import SupplierProductManager from '../SupplierProductManager.vue';
  import * as api from '@/api/base-data/supplier/product';
  import { buildSortPageVo } from '@/utils/utils';

  export default defineComponent({
    name: 'SupplierProductManage',
    components: { SupplierSelector, SupplierProductManager },
    data() {
      return {
        supplierId: undefined,
        supplierName: '',
        searchFormData: { code: '', name: '' },
        tableColumn: [
          { field: 'code', title: '商品编号', width: 180 },
          { field: 'name', title: '商品名称', minWidth: 220 },
          { field: 'suppliers', title: '供应商', minWidth: 300, slots: { default: 'suppliers' } },
        ],
        toolbarConfig: { slots: { buttons: 'toolbar_buttons' } },
        proxyConfig: {
          response: { result: 'datas', total: 'totalCount' },
          ajax: {
            query: ({ page, sorts }) =>
              api.queryProducts({ ...buildSortPageVo(page, sorts), ...this.searchFormData }),
          },
        },
      };
    },
    methods: {
      search() {
        this.$refs.grid.commitProxy('reload');
      },
      refresh() {
        this.$refs.grid.commitProxy('query');
      },
      openManager() {
        if (!this.supplierId) {
          return;
        }
        this.$nextTick(() => this.$refs.manager.openDialog());
      },
    },
  });
</script>

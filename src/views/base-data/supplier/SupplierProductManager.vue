<template>
  <a-modal
    v-model:open="visible"
    :mask-closable="false"
    width="70%"
    :title="`供应商品管理 - ${supplierName}`"
    :style="{ top: '30px' }"
    :footer="null"
  >
    <div v-if="visible" v-loading="loading">
      <vxe-grid
        ref="grid"
        resizable
        show-overflow
        highlight-hover-row
        keep-source
        row-id="id"
        :columns="tableColumn"
        :data="tableData"
        :toolbar-config="toolbarConfig"
        :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }"
        height="480"
      >
        <template #toolbar_buttons>
          <a-space>
            <a-button type="primary" :icon="h(PlusOutlined)" @click="addRow">添加商品</a-button>
          </a-space>
        </template>

        <template #productName="{ row }">
          <span v-if="row.id || row.productId">{{ row.productName || row._productName }}</span>
          <span v-else class="placeholder">请点击"添加商品"选择</span>
        </template>

        <template #isDefault_default="{ row }">
          <a-tag v-if="row.isDefault" color="green">默认</a-tag>
        </template>

        <template #isDefault_edit="{ row }">
          <a-switch v-model:checked="row.isDefault" />
        </template>

        <template #action_default="{ row }">
          <table-action
            outside
            :actions="[
              { label: '删除', permission: ['base-data:supplier:product:delete'], onClick: () => removeRow(row) },
            ]"
          />
        </template>
      </vxe-grid>

      <div class="form-modal-footer" style="margin-top: 16px; text-align: right">
        <a-space>
          <a-button type="primary" :loading="loading" @click="save">保存</a-button>
          <a-button @click="closeDialog">取消</a-button>
        </a-space>
      </div>
    </div>

    <product-selector
      ref="productSelector"
      v-model:value="selectedProductIds"
      multiple
      @input-row="onProductSelected"
    />
  </a-modal>
</template>

<script>
  import { defineComponent, h } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import * as api from '@/api/base-data/supplier/product';
  import { get as getProduct } from '@/api/base-data/product/info';
  import { createSuccess, createError, createConfirm } from '@/hooks/web/msg';
  import ProductSelector from '@/components/Selector/ProductSelector.vue';

  export default defineComponent({
    name: 'SupplierProductManager',
    components: { ProductSelector },
    props: {
      supplierId: {
        type: String,
        default: '',
      },
      supplierName: {
        type: String,
        default: '',
      },
    },
    setup() {
      return { h, PlusOutlined };
    },
    data() {
      return {
        visible: false,
        loading: false,
        tableData: [],
        selectedProductIds: [],
        toolbarConfig: {
          slots: { buttons: 'toolbar_buttons' },
        },
        tableColumn: [
          { field: 'productCode', title: '商品编号', width: 130 },
          {
            field: 'productName',
            title: '商品名称',
            minWidth: 200,
            slots: { default: 'productName' },
          },
          {
            field: 'supplierProductCode',
            title: '供应商商品编号',
            width: 160,
            editRender: {},
          },
          {
            field: 'supplierProductName',
            title: '供应商商品名称',
            width: 160,
            editRender: {},
          },
          {
            field: 'defaultPurchasePrice',
            title: '默认采购价',
            width: 120,
            editRender: { name: '$input', props: { type: 'float', digits: 2 } },
          },
          {
            field: 'minOrderQty',
            title: '最小起订量',
            width: 110,
            editRender: { name: '$input', props: { type: 'float', digits: 2 } },
          },
          {
            field: 'leadTimeDays',
            title: '供货周期(天)',
            width: 110,
            editRender: { name: '$input', props: { type: 'integer' } },
          },
          {
            field: 'isDefault',
            title: '默认供应商',
            width: 100,
            align: 'center',
            slots: { default: 'isDefault_default', edit: 'isDefault_edit' },
          },
          {
            title: '操作',
            width: 90,
            fixed: 'right',
            slots: { default: 'action_default' },
          },
        ],
      };
    },
    methods: {
      openDialog() {
        this.visible = true;
        this.$nextTick(() => this.loadData());
      },
      closeDialog() {
        this.visible = false;
        this.$emit('close');
      },
      getGrid() {
        return this.$refs.grid;
      },
      loadData() {
        if (!this.supplierId) {
          this.tableData = [];
          return;
        }
        this.loading = true;
        api
          .listBySupplier(this.supplierId)
          .then((datas) => {
            this.tableData = datas || [];
            this.fillProductInfo();
          })
          .finally(() => {
            this.loading = false;
          });
      },
      fillProductInfo() {
        const needFill = this.tableData.filter((r) => r.productId && !r.productCode);
        if (needFill.length === 0) {
          return;
        }
        const ids = [...new Set(needFill.map((r) => r.productId))];
        ids.forEach((id) => {
          getProduct(id)
            .then((data) => {
              if (!data) {
                return;
              }
              this.tableData.forEach((r) => {
                if (r.productId === id) {
                  r.productCode = data.code;
                  r.productName = data.name;
                  r.unit = data.unit;
                }
              });
            })
            .catch(() => {});
        });
      },
      // 打开商品选择器新增关联
      addRow() {
        this.$refs.productSelector.openDialog();
      },
      // 商品选择器回调
      onProductSelected(rows) {
        if (!rows || rows.length === 0) {
          return;
        }
        const exists = new Set(this.tableData.map((r) => r.skuId || r.productId));
        rows.forEach((p) => {
          const key = p.skuId || p.productId;
          if (exists.has(key)) {
            createError(`商品【${p.productName || p.name}】已存在关联！`);
            return;
          }
          exists.add(key);
          this.tableData.push({
            id: '',
            supplierId: this.supplierId,
            productId: p.productId,
            productCode: p.productCode || p.code,
            productName: p.productName || p.name,
            skuId: p.skuId || '',
            supplierProductCode: '',
            supplierProductName: '',
            defaultPurchasePrice: null,
            minOrderQty: null,
            leadTimeDays: null,
            isDefault: false,
            description: '',
          });
        });
        this.selectedProductIds = [];
      },
      removeRow(row) {
        createConfirm('确定要删除该商品的供应关联吗？').then(() => {
          if (!row.id) {
            this.tableData = this.tableData.filter((r) => r !== row);
            return;
          }
          this.loading = true;
          api
            .deleteById(row.id)
            .then(() => {
              createSuccess('删除成功！');
              this.tableData = this.tableData.filter((r) => r !== row);
            })
            .finally(() => {
              this.loading = false;
            });
        });
      },
      save() {
        const grid = this.getGrid();
        if (grid) {
          grid.commitProxy && grid.commitProxy('setEditRow', null);
        }
        const rows = this.tableData || [];
        if (rows.length === 0) {
          createError('请先添加要关联的商品！');
          return;
        }
        this.loading = true;
        const tasks = rows.map((row) => {
          if (row.id) {
            return api.update({
              id: row.id,
              supplierProductCode: row.supplierProductCode,
              supplierProductName: row.supplierProductName,
              defaultPurchasePrice: row.defaultPurchasePrice,
              minOrderQty: row.minOrderQty,
              leadTimeDays: row.leadTimeDays,
              isDefault: !!row.isDefault,
              description: row.description || '',
            });
          }
          return api.create({
            supplierId: this.supplierId,
            productId: row.productId,
            skuId: row.skuId || '',
            supplierProductCode: row.supplierProductCode || '',
            supplierProductName: row.supplierProductName || '',
            defaultPurchasePrice: row.defaultPurchasePrice,
            minOrderQty: row.minOrderQty,
            leadTimeDays: row.leadTimeDays,
            isDefault: !!row.isDefault,
            description: row.description || '',
          });
        });
        Promise.all(tasks)
          .then(() => {
            createSuccess('保存成功！');
            this.$emit('confirm');
            this.loadData();
          })
          .finally(() => {
            this.loading = false;
          });
      },
    },
  });
</script>

<style scoped>
  .placeholder {
    color: #bfbfbf;
  }
</style>
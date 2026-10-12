<template>
  <div class="app-card-container">
    <div v-permission="['produce:bom:add']" v-loading="loading">
      <a-alert
        description="提示：BOM（物料清单）用于定义成品与子件的构成关系；子件通过下拉搜索或批量选择添加。"
        type="info"
        show-icon
      />
      <vxe-grid
        ref="grid"
        resizable
        show-overflow
        highlight-hover-row
        keep-source
        row-id="id"
        height="500"
        :data="tableData"
        :columns="tableColumn"
        :toolbar-config="toolbarConfig"
      >
        <!-- 单头表单 -->
        <template #form>
          <j-border>
            <j-form bordered>
              <j-form-item label="BOM编号" required>
                <a-input-group compact>
                  <a-input
                    v-model:value.trim="formData.code"
                    style="width: calc(100% - 75px)"
                    allow-clear
                  />
                  <a-button type="primary" @click="onGenerateCode">点此生成</a-button>
                </a-input-group>
              </j-form-item>
              <j-form-item label="BOM名称" required>
                <a-input v-model:value.trim="formData.name" allow-clear />
              </j-form-item>
              <j-form-item label="成品" required>
                <product-selector
                  v-model:value="formData.mainSkuId"
                  :request-params="{ productType: PRODUCT_TYPE.NORMAL.code }"
                  @input-row="onSelectMainProduct"
                />
              </j-form-item>
              <j-form-item label="产出数量" required>
                <a-input-number
                  v-model:value="formData.outputNum"
                  :min="0.0001"
                  :precision="4"
                  style="width: 100%"
                />
              </j-form-item>
              <j-form-item label="版本">
                <a-input v-model:value.trim="formData.version" allow-clear placeholder="1.0" />
              </j-form-item>
              <j-form-item label="废品率%">
                <a-input-number
                  v-model:value="formData.scrapRate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  style="width: 100%"
                />
              </j-form-item>
              <j-form-item label="默认版本">
                <a-switch v-model:checked="formData.isDefault" />
              </j-form-item>
              <j-form-item label="备注" :span="24">
                <a-input v-model:value.trim="formData.description" allow-clear />
              </j-form-item>
            </j-form>
          </j-border>
        </template>

        <!-- 工具栏 -->
        <template #toolbar_buttons>
          <a-space>
            <a-button type="primary" :icon="h(PlusOutlined)" @click="addDetail">新增子件</a-button>
            <a-button :icon="h(DeleteOutlined)" danger @click="delDetail">删除</a-button>
            <a-button :icon="h(PlusOutlined)" @click="openBatchSelector">批量选择商品</a-button>
          </a-space>
        </template>

        <!-- 子件商品 列 -->
        <template #product_default="{ row, rowIndex }">
          <a-auto-complete
            v-if="isEmpty(row.skuId)"
            v-model:value="row.productName"
            style="width: 100%"
            placeholder="请输入商品编号/名称"
            :options="row.productOptions"
            :dropdown-match-select-width="false"
            :dropdown-style="{ width: '900px' }"
            @search="(e) => queryProduct(e, row, rowIndex)"
          >
            <template #dropdownRender>
              <div v-if="!isEmpty(row.products)">
                <vxe-table
                  :data="row.products"
                  max-height="500"
                  class="cursor-pointer"
                  highlight-hover-row
                  show-overflow
                  :row-config="{ isHover: true }"
                  @cell-click="({ row: product }) => handleSelectProduct(rowIndex, product)"
                >
                  <vxe-column field="productCode" title="商品编号" width="120" />
                  <vxe-column field="skuCode" title="SKU编号" width="120" />
                  <vxe-column field="productName" title="商品名称" min-width="200" />
                  <vxe-column field="salePropertyText" title="销售属性" width="160" />
                  <vxe-column field="spec" title="规格" width="80" />
                  <vxe-column field="unit" title="单位" width="80" />
                  <vxe-column field="categoryName" title="分类" width="120" />
                  <vxe-column field="brandName" title="品牌" width="120" />
                </vxe-table>
              </div>
              <a-empty v-else />
            </template>
          </a-auto-complete>
          <span v-else>{{ row.productName }}</span>
        </template>

        <!-- 单位用量 -->
        <template #unitNum_default="{ row }">
          <a-input-number
            v-model:value="row.unitNum"
            :min="0.000001"
            :precision="6"
            style="width: 100%"
            placeholder="单位用量"
          />
        </template>

        <!-- 损耗率 -->
        <template #scrapRate_default="{ row }">
          <a-input-number
            v-model:value="row.scrapRate"
            :min="0"
            :max="100"
            :precision="2"
            style="width: 100%"
            placeholder="0"
          />
        </template>

        <!-- 关键物料 -->
        <template #isKeyMaterial_default="{ row }">
          <a-switch v-model:checked="row.isKeyMaterial" />
        </template>

        <!-- 排序 -->
        <template #sortOrder_default="{ row }">
          <a-input-number v-model:value="row.sortOrder" :min="0" style="width: 100%" />
        </template>

        <!-- 备注 -->
        <template #description_default="{ row }">
          <a-input v-model:value.trim="row.description" allow-clear />
        </template>
      </vxe-grid>

      <!-- 底部按钮 -->
      <div style="margin-top: 16px; text-align: center">
        <a-space size="large">
          <a-button type="primary" :loading="loading" @click="submit">保存</a-button>
          <a-button :loading="loading" @click="closePage">取消</a-button>
        </a-space>
      </div>
    </div>

    <!-- 批量选择商品 -->
    <product-selector
      ref="batchSelector"
      v-model:value="batchSelectedSkuIds"
      multiple
      @input-row="onBatchSelect"
    />
  </div>
</template>

<script>
  import { h, defineComponent } from 'vue';
  import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import ProductSelector from '@/components/Selector/ProductSelector.vue';
  import * as api from '@/api/produce/bom';
  import * as productApi from '@/api/base-data/product/info';
  import { generateCode } from '@/api/components';
  import { GENERATE_CODE_TYPE } from '@/enums/biz/generateCodeType';
  import { createSuccess, createError, createConfirm } from '@/hooks/web/msg';
  import { isEmpty, uuid } from '@/utils/utils';
  import { PRODUCT_TYPE } from '@/enums/biz/productType';
  import { multiplePageMix } from '@/mixins/multiplePageMix';

  export default defineComponent({
    name: 'ProduceBomAdd',
    components: { ProductSelector },
    mixins: [multiplePageMix],
    setup() {
      return {
        h,
        PlusOutlined,
        DeleteOutlined,
        isEmpty,
        PRODUCT_TYPE,
      };
    },
    data() {
      return {
        loading: false,
        formData: {},
        tableData: [],
        batchSelectedSkuIds: [],
        toolbarConfig: {
          slots: { buttons: 'toolbar_buttons' },
        },
        tableColumn: [
          { type: 'checkbox', width: 45 },
          {
            field: 'productName',
            title: '子件商品',
            minWidth: 260,
            slots: { default: 'product_default' },
          },
          { field: 'skuCode', title: 'SKU编号', width: 120 },
          { field: 'productCode', title: '商品编号', width: 110 },
          { field: 'spec', title: '规格', width: 80 },
          { field: 'unit', title: '单位', width: 70 },
          {
            field: 'unitNum',
            title: '单位用量',
            width: 140,
            slots: { default: 'unitNum_default' },
          },
          {
            field: 'scrapRate',
            title: '损耗率%',
            width: 110,
            slots: { default: 'scrapRate_default' },
          },
          {
            field: 'isKeyMaterial',
            title: '关键物料',
            width: 90,
            slots: { default: 'isKeyMaterial_default' },
          },
          {
            field: 'sortOrder',
            title: '排序',
            width: 90,
            slots: { default: 'sortOrder_default' },
          },
          {
            field: 'description',
            title: '备注',
            minWidth: 140,
            slots: { default: 'description_default' },
          },
        ],
      };
    },
    created() {
      this.initFormData();
    },
    methods: {
      initFormData() {
        this.formData = {
          code: '',
          name: '',
          mainProductId: '',
          mainSkuId: '',
          outputNum: 1,
          scrapRate: 0,
          version: '1.0',
          isDefault: false,
          description: '',
        };
        this.tableData = [];
      },
      onGenerateCode() {
        generateCode(GENERATE_CODE_TYPE.BOM.code).then((res) => {
          this.formData.code = res;
        });
      },
      onSelectMainProduct(row) {
        if (row) {
          this.formData.mainProductId = row.productId;
        }
      },
      emptyDetail() {
        return {
          id: uuid(),
          productId: '',
          skuId: '',
          skuCode: '',
          productCode: '',
          productName: '',
          spec: '',
          unit: '',
          unitNum: undefined,
          scrapRate: 0,
          isKeyMaterial: false,
          sortOrder: 0,
          description: '',
          products: [],
          productOptions: [],
        };
      },
      addDetail() {
        this.tableData.push(this.emptyDetail());
      },
      delDetail() {
        const records = this.$refs.grid.getCheckboxRecords();
        if (isEmpty(records)) {
          createError('请选择要删除的明细！');
          return;
        }
        createConfirm('是否确定删除选中的明细？').then(() => {
          const ids = records.map((t) => t.id);
          this.tableData = this.tableData.filter((t) => !ids.includes(t.id));
        });
      },
      // 搜索子件商品
      queryProduct(queryString, row) {
        if (isEmpty(queryString)) {
          row.products = [];
          row.productOptions = [];
          return;
        }
        productApi
          .selector({ pageIndex: 1, pageSize: 20, name: queryString, available: true })
          .then((res) => {
            const list = res.datas || res.records || [];
            row.products = list;
            row.productOptions = list.map((item) => ({
              value: item.skuId || item.id,
              label: (item.skuCode || item.productCode) + ' ' + item.productName,
            }));
          });
      },
      handleSelectProduct(index, product) {
        const row = this.tableData[index];
        // 已选中的则不允许重复
        if (this.tableData.some((t, i) => i !== index && t.skuId === product.skuId)) {
          createError('该商品已在明细中！');
          return;
        }
        Object.assign(row, {
          productId: product.productId,
          skuId: product.skuId,
          skuCode: product.skuCode,
          productCode: product.productCode,
          productName: product.productName,
          spec: product.spec,
          unit: product.unit,
        });
      },
      openBatchSelector() {
        // 调用内部 DialogTable 的 onOpen 打开弹窗
        const selector = this.$refs.batchSelector;
        if (selector && selector.$refs && selector.$refs.selector) {
          selector.$refs.selector.onOpen();
        }
      },
      onBatchSelect(rows) {
        if (!isEmpty(rows)) {
          rows.forEach((p) => {
            if (this.tableData.some((t) => t.skuId === p.skuId)) {
              return; // 跳过已存在
            }
            this.tableData.push(
              Object.assign(this.emptyDetail(), {
                productId: p.productId,
                skuId: p.skuId,
                skuCode: p.skuCode,
                productCode: p.productCode,
                productName: p.productName,
                spec: p.spec,
                unit: p.unit,
              }),
            );
          });
        }
        // 重置，便于下次重新选择
        this.batchSelectedSkuIds = [];
      },
      closePage() {
        this.closeCurrentPage();
      },
      buildParams() {
        if (isEmpty(this.formData.code)) {
          createError('请输入BOM编号！');
          return null;
        }
        if (isEmpty(this.formData.name)) {
          createError('请输入BOM名称！');
          return null;
        }
        if (isEmpty(this.formData.mainSkuId)) {
          createError('请选择成品！');
          return null;
        }
        if (isEmpty(this.tableData)) {
          createError('请录入BOM明细！');
          return null;
        }
        // 子件校验
        for (let i = 0; i < this.tableData.length; i++) {
          const d = this.tableData[i];
          if (isEmpty(d.skuId)) {
            createError('第' + (i + 1) + '行子件商品为空！');
            return null;
          }
          if (isEmpty(d.unitNum) || d.unitNum <= 0) {
            createError('第' + (i + 1) + '行单位用量必须大于0！');
            return null;
          }
        }
        // 重复校验
        const skuIds = this.tableData.map((t) => t.skuId);
        if (new Set(skuIds).size !== skuIds.length) {
          createError('BOM明细中存在重复商品！');
          return null;
        }
        if (skuIds.includes(this.formData.mainSkuId)) {
          createError('成品商品不能作为子件！');
          return null;
        }

        return {
          code: this.formData.code,
          name: this.formData.name,
          mainProductId: this.formData.mainProductId,
          mainSkuId: this.formData.mainSkuId,
          outputNum: this.formData.outputNum,
          scrapRate: this.formData.scrapRate,
          isDefault: this.formData.isDefault,
          version: this.formData.version,
          description: this.formData.description,
          details: this.tableData.map((t) => ({
            productId: t.productId,
            skuId: t.skuId,
            unitNum: t.unitNum,
            scrapRate: t.scrapRate,
            isKeyMaterial: t.isKeyMaterial,
            sortOrder: t.sortOrder,
            description: t.description,
          })),
        };
      },
      submit() {
        const params = this.buildParams();
        if (!params) {
          return;
        }
        this.loading = true;
        api
          .create(params)
          .then(() => {
            createSuccess('保存成功！');
            this.closeCurrentPage();
          })
          .finally(() => {
            this.loading = false;
          });
      },
    },
  });
</script>

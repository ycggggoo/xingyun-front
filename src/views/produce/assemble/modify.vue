<template>
  <div class="app-card-container">
    <div v-permission="['produce:assemble:modify']" v-loading="loading">
      <j-border>
        <j-form
          ref="form"
          bordered
          :model="formData"
          :rules="{
            scId: [{ required: true, message: '请选择仓库' }],
            bomId: [{ required: true, message: '请选择BOM' }],
            totalNum: [{ required: true, message: '请输入组装数量' }],
          }"
        >
          <j-form-item label="单号">
            {{ formData.code }}
          </j-form-item>
          <j-form-item label="仓库" required>
            <store-center-selector v-model:value="formData.scId" />
          </j-form-item>
          <j-form-item label="BOM" required>
            <a-select
              v-model:value="formData.bomId"
              :loading="bomLoading"
              show-search
              option-filter-prop="label"
              @change="onBomChange"
            >
              <a-select-option
                v-for="item in bomOptions"
                :key="item.id"
                :value="item.id"
                :label="item.code + ' ' + item.name"
              >
                {{ item.code }} {{ item.name }}（{{ item.mainProductName }}）
              </a-select-option>
            </a-select>
          </j-form-item>
          <j-form-item label="组装数量" required>
            <a-input-number
              v-model:value="formData.totalNum"
              :min="0"
              :precision="8"
              style="width: 100%"
            />
          </j-form-item>
          <j-form-item label="备注" :span="24">
            <a-textarea v-model:value.trim="formData.description" maxlength="200" />
          </j-form-item>
        </j-form>
      </j-border>

      <!-- 子件明细 -->
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
      >
        <template #stockNum_default="{ row }">
          <a-input-number
            v-model:value="row.stockNum"
            :min="0"
            :precision="8"
            style="width: 100%"
          />
        </template>

        <template #description_default="{ row }">
          <a-input v-model:value="row.description" />
        </template>
      </vxe-grid>

      <div style="text-align: center; background-color: #ffffff; padding: 8px 0">
        <a-space>
          <a-button type="primary" :loading="loading" @click="submit">保存</a-button>
          <a-button :loading="loading" @click="closeDialog">关闭</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>
<script>
  import { defineComponent } from 'vue';
  import StoreCenterSelector from '@/components/Selector/StoreCenterSelector.vue';
  import * as api from '@/api/produce/assemble';
  import * as bomApi from '@/api/produce/bom';
  import { multiplePageMix } from '@/mixins/multiplePageMix';
  import { isEmpty, isFloat, isFloatGtZero, isNumberPrecision, uuid } from '@/utils/utils';
  import { createSuccess, createError } from '@/hooks/web/msg';

  export default defineComponent({
    name: 'ModifyProduceAssembleSheet',
    components: {
      StoreCenterSelector,
    },
    mixins: [multiplePageMix],
    data() {
      return {
        loading: false,
        bomLoading: false,
        bomOptions: [],
        id: this.$route.params.id,
        formData: {},
        tableData: [],
        tableColumn: [
          { type: 'seq', width: 50, title: '序号' },
          { field: 'skuCode', title: 'SKU编号', width: 120 },
          { field: 'productCode', title: '商品编号', width: 120 },
          { field: 'productName', title: '子件商品', minWidth: 180 },
          { field: 'productSpec', title: '规格', width: 90 },
          { field: 'productUnit', title: '单位', width: 70 },
          { field: 'num', title: '单位用量', width: 90 },
          {
            field: 'stockNum',
            title: '消耗数量',
            width: 140,
            slots: { default: 'stockNum_default' },
          },
          {
            field: 'description',
            title: '备注',
            width: 180,
            slots: { default: 'description_default' },
          },
        ],
      };
    },
    created() {
      this.loadBomOptions();
      this.loadData();
    },
    methods: {
      closeDialog() {
        this.closeCurrentPage();
      },
      loadBomOptions() {
        this.bomLoading = true;
        bomApi
          .query({ pageIndex: 1, pageSize: 1000, status: 1 })
          .then((res) => {
            this.bomOptions = res.datas || [];
          })
          .finally(() => {
            this.bomLoading = false;
          });
      },
      loadData() {
        this.loading = true;
        api
          .getDetail(this.id)
          .then((res) => {
            this.formData = {
              code: res.code,
              scId: res.scId,
              bomId: res.bomId,
              totalNum: res.totalNum,
              description: res.description,
            };
            this.tableData = (res.details || []).map((item) => {
              return {
                id: uuid(),
                productId: item.productId,
                skuId: item.skuId,
                skuCode: item.skuCode,
                productCode: item.productCode,
                productName: item.productName,
                productSpec: item.productSpec,
                productUnit: item.productUnit,
                num: item.num,
                stockNum: item.stockNum,
                description: item.description,
              };
            });
          })
          .finally(() => {
            this.loading = false;
          });
      },
      // 更换BOM时重新带出明细
      onBomChange(bomId) {
        if (isEmpty(bomId)) {
          this.tableData = [];
          return;
        }
        bomApi.get(bomId).then((res) => {
          const totalNum = this.formData.totalNum;
          this.tableData = (res.details || []).map((item) => {
            return {
              id: uuid(),
              productId: item.productId,
              skuId: item.skuId,
              skuCode: item.skuCode,
              productCode: item.productCode,
              productName: item.productName,
              productSpec: item.productSpec,
              productUnit: item.productUnit,
              num: item.unitNum,
              stockNum:
                !isEmpty(totalNum) && isFloatGtZero(totalNum)
                  ? parseFloat((item.unitNum * totalNum).toFixed(8))
                  : '',
              description: '',
            };
          });
        });
      },
      validData() {
        if (isEmpty(this.tableData)) {
          createError('子件明细不能为空！');
          return false;
        }
        for (let i = 0; i < this.tableData.length; i++) {
          const data = this.tableData[i];
          if (isEmpty(data.stockNum) || !isFloat(data.stockNum) || !isFloatGtZero(data.stockNum)) {
            createError('第' + (i + 1) + '行消耗数量必须是大于0的数字！');
            return false;
          }
          if (!isNumberPrecision(data.stockNum, 8)) {
            createError('第' + (i + 1) + '行消耗数量最多允许8位小数！');
            return false;
          }
        }

        return true;
      },
      submit() {
        this.$refs.form.validate().then(() => {
          if (!this.validData()) {
            return;
          }
          const params = {
            id: this.id,
            scId: this.formData.scId,
            bomId: this.formData.bomId,
            totalNum: this.formData.totalNum,
            description: this.formData.description,
            products: this.tableData.map((item) => {
              return {
                productId: item.productId,
                skuId: item.skuId,
                num: item.num,
                stockNum: item.stockNum,
                description: item.description,
              };
            }),
          };
          this.loading = true;
          api
            .update(params)
            .then(() => {
              createSuccess('保存成功！');
              this.$emit('confirm');
              this.closeDialog();
            })
            .finally(() => {
              this.loading = false;
            });
        });
      },
    },
  });
</script>

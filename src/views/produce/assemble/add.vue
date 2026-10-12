<template>
  <div class="app-card-container">
    <div v-permission="['produce:assemble:add']" v-loading="loading">
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
              @change="calcConsume"
            />
          </j-form-item>
          <j-form-item label="成品">
            <span v-if="!isEmpty(bomDetail.mainSkuCode)">
              {{ bomDetail.mainSkuCode }} / {{ bomDetail.mainProductCode }} /
              {{ bomDetail.mainProductName }}
            </span>
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
        :toolbar-config="toolbarConfig"
      >
        <template #toolbar_buttons>
          <a-space>
            <a-button type="primary" :icon="h(SearchOutlined)" @click="calcShortage"
              >缺料计算</a-button
            >
          </a-space>
        </template>

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

        <template #shortage_default="{ row }">
          <span v-if="row.shortageNum > 0" style="color: #f5222d">{{ row.shortageNum }}</span>
          <span v-else-if="row.shortageNum !== undefined && row.shortageNum !== null" style="color: #52c41a">充足</span>
          <span v-else>-</span>
        </template>
      </vxe-grid>

      <j-border title="合计">
        <j-form bordered label-width="140px">
          <j-form-item label="子件总数" :span="6">
            <a-input v-model:value="formData.productNum" class="number-input" readonly />
          </j-form-item>
          <j-form-item label="消耗总量" :span="6">
            <a-input v-model:value="formData.totalStockNum" class="number-input" readonly />
          </j-form-item>
        </j-form>
      </j-border>

      <div style="text-align: center; background-color: #ffffff; padding: 8px 0">
        <a-space>
          <a-button
            v-permission="['produce:assemble:add']"
            type="primary"
            :loading="loading"
            @click="submit"
            >保存</a-button
          >
          <a-button
            v-permission="['produce:assemble:approve']"
            type="primary"
            :loading="loading"
            @click="directApprovePass"
            >审核通过</a-button
          >
          <a-button :loading="loading" @click="closeDialog">关闭</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>
<script>
  import { h, defineComponent } from 'vue';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import StoreCenterSelector from '@/components/Selector/StoreCenterSelector.vue';
  import * as api from '@/api/produce/assemble';
  import * as bomApi from '@/api/produce/bom';
  import { multiplePageMix } from '@/mixins/multiplePageMix';
  import { isEmpty, isFloat, isFloatGtZero, isNumberPrecision, uuid, add } from '@/utils/utils';
  import { createSuccess, createError, createConfirm } from '@/hooks/web/msg';

  export default defineComponent({
    name: 'AddProduceAssembleSheet',
    components: {
      StoreCenterSelector,
    },
    mixins: [multiplePageMix],
    setup() {
      return {
        h,
        SearchOutlined,
        isEmpty,
      };
    },
    data() {
      return {
        loading: false,
        bomLoading: false,
        bomOptions: [],
        bomDetail: {},
        formData: {},
        tableData: [],
        toolbarConfig: {
          slots: { buttons: 'toolbar_buttons' },
        },
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
          { field: 'shortageNum', title: '缺口', width: 90, slots: { default: 'shortage_default' } },
          {
            field: 'description',
            title: '备注',
            width: 180,
            slots: { default: 'description_default' },
          },
        ],
      };
    },
    computed: {},
    created() {
      this.open();
    },
    methods: {
      closeDialog() {
        this.closeCurrentPage();
      },
      // 初始化表单数据
      initFormData() {
        this.formData = {
          scId: '',
          bomId: undefined,
          totalNum: undefined,
          description: '',
          productNum: 0,
          totalStockNum: 0,
        };
        this.bomDetail = {};
        this.tableData = [];
      },
      open() {
        this.initFormData();
        this.loadBomOptions();
      },
      // 加载启用状态的BOM列表
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
      // 选择BOM后加载明细
      onBomChange(bomId) {
        if (isEmpty(bomId)) {
          this.bomDetail = {};
          this.tableData = [];
          return;
        }
        this.loading = true;
        bomApi
          .get(bomId)
          .then((res) => {
            this.bomDetail = res;
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
                stockNum: '',
                shortageNum: null,
                description: '',
              };
            });
            this.calcConsume();
          })
          .finally(() => {
            this.loading = false;
          });
      },
      // 组装数量变化时重算消耗数量
      calcConsume() {
        const totalNum = this.formData.totalNum;
        if (!isEmpty(totalNum) && isFloatGtZero(totalNum)) {
          this.tableData.forEach((row) => {
            row.stockNum = parseFloat((row.num * totalNum).toFixed(8));
          });
          this.calcTotal();
        }
      },
      calcTotal() {
        this.formData.productNum = this.tableData.length;
        let total = 0;
        this.tableData.forEach((row) => {
          if (isFloat(row.stockNum)) {
            total = add(total, row.stockNum);
          }
        });
        this.formData.totalStockNum = total;
      },
      validData() {
        if (isEmpty(this.tableData)) {
          createError('请选择BOM以带出子件明细！');
          return false;
        }
        for (let i = 0; i < this.tableData.length; i++) {
          const data = this.tableData[i];
          if (isEmpty(data.stockNum)) {
            createError('第' + (i + 1) + '行消耗数量不允许为空！');
            return false;
          }
          if (!isFloat(data.stockNum)) {
            createError('第' + (i + 1) + '行消耗数量必须是数字！');
            return false;
          }
          if (!isFloatGtZero(data.stockNum)) {
            createError('第' + (i + 1) + '行消耗数量必须大于0！');
            return false;
          }
          if (!isNumberPrecision(data.stockNum, 8)) {
            createError('第' + (i + 1) + '行消耗数量最多允许8位小数！');
            return false;
          }
        }

        return true;
      },
      buildParams() {
        return {
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
      },
      // 缺料计算
      calcShortage() {
        if (isEmpty(this.formData.scId)) {
          createError('请先选择仓库！');
          return;
        }
        if (isEmpty(this.formData.bomId)) {
          createError('请先选择BOM！');
          return;
        }
        if (isEmpty(this.formData.totalNum) || !isFloatGtZero(this.formData.totalNum)) {
          createError('请先输入组装数量！');
          return;
        }
        this.loading = true;
        api
          .calcShortage({
            bomId: this.formData.bomId,
            totalNum: this.formData.totalNum,
            scId: this.formData.scId,
          })
          .then((res) => {
            const shortageMap = {};
            (res || []).forEach((item) => {
              shortageMap[item.skuId] = item.shortageNum;
            });
            this.tableData.forEach((row) => {
              row.shortageNum = shortageMap[row.skuId];
            });
            createSuccess('缺料计算完成，缺口已标注！');
          })
          .finally(() => {
            this.loading = false;
          });
      },
      // 提交表单事件
      submit() {
        this.$refs.form.validate().then(() => {
          if (!this.validData()) {
            return;
          }
          const params = this.buildParams();
          this.loading = true;
          api
            .create(params)
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
      // 直接审核通过
      directApprovePass() {
        this.$refs.form.validate().then(() => {
          if (!this.validData()) {
            return;
          }
          const params = this.buildParams();
          createConfirm('对组装单执行审核通过操作？审核后将扣减子件库存、增加成品库存！').then(() => {
            this.loading = true;
            api
              .directApprovePass(params)
              .then(() => {
                createSuccess('审核通过！');
                this.$emit('confirm');
                this.closeDialog();
              })
              .finally(() => {
                this.loading = false;
              });
          });
        });
      },
    },
  });
</script>

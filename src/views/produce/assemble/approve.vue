<template>
  <div class="app-card-container">
    <div v-permission="['produce:assemble:query']" v-loading="loading">
      <j-border>
        <j-form bordered>
          <j-form-item label="单号">
            {{ formData.code }}
          </j-form-item>
          <j-form-item label="仓库" required>
            {{ formData.scName }}
          </j-form-item>
          <j-form-item label="成品" required>
            {{ formData.skuCode }} / {{ formData.productCode }} / {{ formData.productName }}
          </j-form-item>
          <j-form-item label="组装数量" required>
            {{ formData.totalNum }}
          </j-form-item>
          <j-form-item label="备注" :span="24">
            <a-textarea v-model:value.trim="formData.description" maxlength="200" />
          </j-form-item>
          <j-form-item label="状态">
            <span
              v-if="ASSEMBLE_SHEET_STATUS.APPROVE_PASS.equalsCode(formData.status)"
              style="color: #52c41a"
              >{{ ASSEMBLE_SHEET_STATUS.getDesc(formData.status) }}</span
            >
            <span
              v-else-if="ASSEMBLE_SHEET_STATUS.APPROVE_REFUSE.equalsCode(formData.status)"
              style="color: #f5222d"
              >{{ ASSEMBLE_SHEET_STATUS.getDesc(formData.status) }}</span
            >
            <span v-else style="color: #303133">{{
              ASSEMBLE_SHEET_STATUS.getDesc(formData.status)
            }}</span>
          </j-form-item>
          <j-form-item label="拒绝理由" :span="16" :content-nest="false">
            <a-input
              v-if="ASSEMBLE_SHEET_STATUS.APPROVE_REFUSE.equalsCode(formData.status)"
              v-model:value="formData.refuseReason"
              readonly
            />
          </j-form-item>
          <j-form-item label="操作人">
            <span>{{ formData.updateBy }}</span>
          </j-form-item>
          <j-form-item label="操作时间" :span="16">
            <span>{{ formData.updateTime }}</span>
          </j-form-item>
          <j-form-item
            v-if="
              ASSEMBLE_SHEET_STATUS.APPROVE_PASS.equalsCode(formData.status) ||
              ASSEMBLE_SHEET_STATUS.APPROVE_REFUSE.equalsCode(formData.status)
            "
            label="审核人"
          >
            <span>{{ formData.approveBy }}</span>
          </j-form-item>
          <j-form-item
            v-if="
              ASSEMBLE_SHEET_STATUS.APPROVE_PASS.equalsCode(formData.status) ||
              ASSEMBLE_SHEET_STATUS.APPROVE_REFUSE.equalsCode(formData.status)
            "
            label="审核时间"
            :span="16"
          >
            <span>{{ formData.approveTime }}</span>
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
      />

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
            v-permission="['produce:assemble:approve']"
            type="primary"
            :loading="loading"
            @click="approvePass"
            >审核通过</a-button
          >
          <a-button
            v-if="ASSEMBLE_SHEET_STATUS.CREATED.equalsCode(formData.status)"
            v-permission="['produce:assemble:approve']"
            danger
            :loading="loading"
            @click="approveRefuse"
            >审核拒绝</a-button
          >
          <a-button :loading="loading" @click="closeDialog">关闭</a-button>
        </a-space>
      </div>
    </div>

    <approve-refuse ref="approveRefuseDialog" @confirm="doApproveRefuse" />
  </div>
</template>
<script>
  import { defineComponent } from 'vue';
  import ApproveRefuse from '@/components/ApproveRefuse';
  import * as api from '@/api/produce/assemble';
  import { multiplePageMix } from '@/mixins/multiplePageMix';
  import { isEmpty, isFloatGeZero, add } from '@/utils/utils';
  import { createSuccess, createConfirm } from '@/hooks/web/msg';
  import { ASSEMBLE_SHEET_STATUS } from '@/enums/biz/assembleSheetStatus';

  export default defineComponent({
    name: 'ApproveProduceAssembleSheet',
    components: {
      ApproveRefuse,
    },
    mixins: [multiplePageMix],
    setup() {
      return {
        ASSEMBLE_SHEET_STATUS,
      };
    },
    data() {
      return {
        id: this.$route.params.id,
        loading: false,
        formData: {},
        tableColumn: [
          { type: 'seq', width: 50 },
          { field: 'skuCode', title: 'SKU编号', width: 120 },
          { field: 'productCode', title: '商品编号', width: 120 },
          { field: 'productName', title: '子件商品', minWidth: 220 },
          { field: 'productSpec', title: '规格', width: 90 },
          { field: 'productUnit', title: '单位', width: 80 },
          { field: 'num', title: '单位用量', width: 100, align: 'right' },
          { field: 'stockNum', title: '消耗数量', width: 100, align: 'right' },
          { field: 'description', title: '备注', width: 160 },
        ],
        tableData: [],
      };
    },
    created() {
      this.openDialog();
    },
    methods: {
      openDialog() {
        this.initFormData();
        this.loadData();
      },
      closeDialog() {
        this.closeCurrentPage();
      },
      initFormData() {
        this.formData = {
          code: '',
          scName: '',
          skuCode: '',
          productCode: '',
          productName: '',
          totalNum: '',
          description: '',
          updateBy: '',
          updateTime: '',
          approveBy: '',
          approveTime: '',
          status: '',
          refuseReason: '',
          productNum: 0,
          totalStockNum: 0,
        };
        this.tableData = [];
      },
      calcSum() {
        let productNum = 0;
        let totalStockNum = 0;
        this.tableData.forEach((item) => {
          if (!isEmpty(item.productId)) {
            productNum += 1;
            if (isFloatGeZero(item.stockNum)) {
              totalStockNum = add(item.stockNum, totalStockNum);
            }
          }
        });
        this.formData.productNum = productNum;
        this.formData.totalStockNum = totalStockNum;
      },
      loadData() {
        this.loading = true;
        api
          .getDetail(this.id)
          .then((res) => {
            Object.assign(this.formData, {
              code: res.code,
              scName: res.scName,
              skuCode: res.skuCode,
              productCode: res.productCode,
              productName: res.productName,
              totalNum: res.totalNum,
              description: res.description,
              updateBy: res.updateBy,
              updateTime: res.updateTime,
              approveBy: res.approveBy,
              approveTime: res.approveTime,
              status: res.status,
              refuseReason: res.refuseReason,
            });
            this.tableData = res.details || [];
            this.calcSum();
          })
          .finally(() => {
            this.loading = false;
          });
      },
      // 审核通过
      approvePass() {
        createConfirm('对组装单执行审核通过操作？审核后将扣减子件库存、增加成品库存！').then(() => {
          this.loading = true;
          api
            .approvePass({
              id: this.id,
              description: this.formData.description,
            })
            .then(() => {
              createSuccess('审核通过！');
              this.$emit('confirm');
              this.closeDialog();
            })
            .finally(() => {
              this.loading = false;
            });
        });
      },
      // 审核拒绝
      approveRefuse() {
        this.$refs.approveRefuseDialog.openDialog();
      },
      doApproveRefuse(reason) {
        this.loading = true;
        api
          .approveRefuse({
            id: this.id,
            refuseReason: reason,
          })
          .then(() => {
            createSuccess('审核拒绝！');
            this.$emit('confirm');
            this.closeDialog();
          })
          .finally(() => {
            this.loading = false;
          });
      },
    },
  });
</script>

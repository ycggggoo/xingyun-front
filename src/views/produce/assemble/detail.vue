<template>
  <a-modal
    v-model:open="visible"
    :mask-closable="false"
    width="75%"
    title="组装单详情"
    :style="{ top: '20px' }"
    :footer="null"
  >
    <div v-if="visible" v-loading="loading">
      <j-border>
        <j-form bordered label-width="110px">
          <j-form-item label="单号">{{ formData.code }}</j-form-item>
          <j-form-item label="仓库">{{ formData.scName }}</j-form-item>
          <j-form-item label="成品">
            {{ formData.skuCode }} / {{ formData.productCode }} / {{ formData.productName }}
          </j-form-item>
          <j-form-item label="组装数量">{{ formData.totalNum }}</j-form-item>
          <j-form-item label="状态">
            <a-tag v-if="formData.status === 0" color="default">待审核</a-tag>
            <a-tag v-else-if="formData.status === 3" color="success">审核通过</a-tag>
            <a-tag v-else-if="formData.status === 6" color="error">审核拒绝</a-tag>
          </j-form-item>
          <j-form-item v-if="formData.status === 6" label="拒绝原因" :span="24">
            {{ formData.refuseReason }}
          </j-form-item>
          <j-form-item label="备注" :span="24">{{ formData.description }}</j-form-item>
          <j-form-item label="创建人">{{ formData.createBy }}</j-form-item>
          <j-form-item label="创建时间">{{ formData.createTime }}</j-form-item>
          <j-form-item label="审核人">{{ formData.approveBy }}</j-form-item>
          <j-form-item label="审核时间">{{ formData.approveTime }}</j-form-item>
        </j-form>
      </j-border>

      <div style="margin-top: 12px">
        <vxe-grid
          ref="grid"
          resizable
          show-overflow
          highlight-hover-row
          row-id="id"
          :data="formData.details"
          :columns="tableColumn"
          height="400"
        />
      </div>
    </div>
  </a-modal>
</template>

<script>
  import { defineComponent } from 'vue';
  import * as api from '@/api/produce/assemble';

  export default defineComponent({
    name: 'ProduceAssembleSheetDetail',
    props: {
      id: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        visible: false,
        loading: false,
        formData: {},
        tableColumn: [
          { type: 'seq', width: 50, title: '序号' },
          { field: 'skuCode', title: 'SKU编号', width: 120 },
          { field: 'productCode', title: '商品编号', width: 110 },
          { field: 'productName', title: '子件商品', minWidth: 200 },
          { field: 'productSpec', title: '规格', width: 80 },
          { field: 'productUnit', title: '单位', width: 70 },
          { field: 'num', title: '单位用量', width: 100 },
          { field: 'stockNum', title: '消耗数量', width: 100 },
          { field: 'description', title: '备注', minWidth: 140 },
        ],
      };
    },
    methods: {
      openDialog() {
        this.visible = true;
        this.loading = true;
        api
          .getDetail(this.id)
          .then((res) => {
            this.formData = res;
          })
          .finally(() => {
            this.loading = false;
          });
      },
      closeDialog() {
        this.visible = false;
        this.$emit('close');
      },
    },
  });
</script>

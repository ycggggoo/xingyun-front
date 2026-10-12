<template>
  <a-modal
    v-model:open="visible"
    :mask-closable="false"
    width="75%"
    title="BOM详情"
    :style="{ top: '20px' }"
    :footer="null"
  >
    <div v-if="visible" v-loading="loading">
      <j-border>
        <j-form bordered label-width="110px">
          <j-form-item label="BOM编号">{{ formData.code }}</j-form-item>
          <j-form-item label="BOM名称">{{ formData.name }}</j-form-item>
          <j-form-item label="成品">
            {{ formData.mainSkuCode }} / {{ formData.mainProductCode }} / {{ formData.mainProductName }}
          </j-form-item>
          <j-form-item label="产出数量">{{ formData.outputNum }}</j-form-item>
          <j-form-item label="废品率%">{{ formData.scrapRate }}</j-form-item>
          <j-form-item label="版本">{{ formData.version }}</j-form-item>
          <j-form-item label="默认版本">
            <a-tag v-if="formData.isDefault" color="blue">默认</a-tag>
            <span v-else>否</span>
          </j-form-item>
          <j-form-item label="状态">
            <a-tag v-if="formData.status === 0" color="default">草稿</a-tag>
            <a-tag v-else-if="formData.status === 1" color="success">启用</a-tag>
            <a-tag v-else-if="formData.status === 2" color="warning">停用</a-tag>
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
  import * as api from '@/api/produce/bom';

  export default defineComponent({
    name: 'ProduceBomDetail',
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
          { field: 'unitNum', title: '单位用量', width: 110 },
          { field: 'scrapRate', title: '损耗率%', width: 90 },
          { field: 'isKeyMaterial', title: '关键物料', width: 90, formatter: ({ cellValue }) => (cellValue ? '是' : '否') },
          { field: 'sortOrder', title: '排序', width: 80 },
          { field: 'description', title: '备注', minWidth: 140 },
        ],
      };
    },
    methods: {
      openDialog() {
        this.visible = true;
        this.loading = true;
        api
          .get(this.id)
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

<template>
  <a-modal
    v-model:open="visible"
    title="订单查看范围"
    :mask-closable="false"
    :confirm-loading="loading"
    :ok-button-props="{ disabled: loading || !loaded }"
    @ok="submit"
  >
    <div v-loading="loading">
      <p>设置该角色可查看的采购、销售订单，按单据上的采购员／销售员判断归属。</p>
      <a-radio-group v-model:value="scope">
        <a-space direction="vertical">
          <a-radio :value="0">未设置：沿用现有查看权限</a-radio>
          <a-radio :value="1">本人：只看业务员为本人的单据</a-radio>
          <a-radio :value="2">本部门：看所属部门业务员的单据，不含下级部门</a-radio>
        </a-space>
      </a-radio-group>
      <p class="scope-tip">
        同时有本人和本部门范围时，按本部门查看。此设置不授予查询、新增、修改或审批权限。
      </p>
    </div>
  </a-modal>
</template>

<script>
  import { defineComponent } from 'vue';
  import * as api from '@/api/system/role/orderViewScope';
  import { createSuccess } from '@/hooks/web/msg';

  export default defineComponent({
    props: {
      id: { type: String, required: true },
    },
    data() {
      return { visible: false, loading: false, loaded: false, scope: 0 };
    },
    methods: {
      openDialog() {
        this.visible = true;
        this.loading = true;
        this.loaded = false;
        this.scope = 0;
        const roleId = this.id;
        return api
          .get(roleId)
          .then((scope) => {
            if (this.visible && this.id === roleId) {
              this.scope = scope;
              this.loaded = true;
            }
          })
          .finally(() => {
            if (this.id === roleId) this.loading = false;
          });
      },
      submit() {
        if (this.loading || !this.loaded) return;
        this.loading = true;
        return api
          .save(this.id, this.scope)
          .then(() => {
            createSuccess('保存成功！');
            this.visible = false;
          })
          .finally(() => {
            this.loading = false;
          });
      },
    },
  });
</script>

<style scoped>
  .scope-tip {
    margin-top: 16px;
    color: #666;
  }
</style>

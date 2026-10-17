// Supplier bindings assist purchasing; missing bindings never prohibit saving.
export async function warnUnlinkedSupplierProducts(params, listBySupplier, warn) {
  try {
    const bindings = (await listBySupplier(params.supplierId)) || [];
    const unlinked = params.products.reduce((rows, product, index) => {
      const matched = bindings.some(
        (binding) => binding.productId === product.productId
          && (!binding.skuId || binding.skuId === product.skuId),
      );
      if (!matched) rows.push(index + 1);
      return rows;
    }, []);
    if (unlinked.length) {
      warn(`第${unlinked.join('、')}行尚未维护与当前供应商的有效关联，请确认供货关系；不影响保存。`);
    }
  } catch {
    warn('暂时无法核对供应商商品关联，请自行确认供货关系；不影响保存。');
  }
}

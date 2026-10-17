import { bignumber } from 'mathjs';

function validPrice(value) {
  return /^\d+(\.\d*)?$/.test(String(value)) && Number.isFinite(Number(value));
}

function taxFactor(taxRate) {
  return bignumber(taxRate || 0)
    .div(100)
    .plus(1);
}

// 商品资料是税前价；订单 API 的 purchasePrice 始终是含税价。
export function toTaxPurchasePrice(price, taxRate) {
  return validPrice(price) ? Number(bignumber(price).mul(taxFactor(taxRate)).toFixed(6)) : '';
}

export function withProductPurchasePrice(product) {
  return {
    ...product,
    preTaxPurchasePrice: product.purchasePrice,
    purchaseOrderDetailId: '',
    purchasePrice: toTaxPurchasePrice(product.purchasePrice, product.taxRate),
    _originalPreTaxPrice: undefined,
    _originalTaxPrice: undefined,
  };
}

export function withOrderPurchasePrice(detail) {
  const preTaxPurchasePrice = validPrice(detail.purchasePrice)
    ? Number(bignumber(detail.purchasePrice).div(taxFactor(detail.taxRate)).toFixed(6))
    : '';
  return {
    ...detail,
    preTaxPurchasePrice,
    purchaseOrderDetailId: detail.id,
    _originalPreTaxPrice: preTaxPurchasePrice,
    _originalTaxPrice: detail.purchasePrice,
  };
}

export function setTaxExclusivePrice(row, price) {
  row.preTaxPurchasePrice = price;
  // 旧单反算税前价可能发生舍入；相同报价回填（包括 Excel）仍保留原含税值。
  row.purchasePrice =
    validPrice(price) &&
    row._originalTaxPrice !== undefined &&
    bignumber(price).eq(row._originalPreTaxPrice)
      ? row._originalTaxPrice
      : toTaxPurchasePrice(price, row.taxRate);
}

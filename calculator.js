(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ShopeeCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const PERCENTAGE_FEE = 0.2;
  const FIXED_ITEM_FEE_CENTS = 400;

  function parseMoneyToCents(raw) {
    let value = String(raw || "").trim().replace(/R\$/gi, "").replace(/\s/g, "");
    if (!value) return null;
    if (value.includes(",")) value = value.replace(/\./g, "").replace(",", ".");
    else if ((value.match(/\./g) || []).length > 1 || (value.includes(".") && value.split(".").pop().length === 3)) value = value.replace(/\./g, "");
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
    const cents = Math.round(Number(value) * 100);
    return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
  }

  function parseQuantity(raw) {
    return /^\d+$/.test(String(raw).trim()) && Number(raw) > 0 ? Number(raw) : null;
  }

  function calculateFromTarget(targetPerItemCents, quantity, orderFeeCents) {
    const targetTotalCents = targetPerItemCents * quantity;
    const fixedItemFeeCents = FIXED_ITEM_FEE_CENTS * quantity;
    const grossRequiredCents = targetTotalCents + fixedItemFeeCents + orderFeeCents;
    const recommendedPricePerItemCents = Math.ceil(grossRequiredCents / ((1 - PERCENTAGE_FEE) * quantity));
    return calculateFromPrice(recommendedPricePerItemCents, quantity, orderFeeCents);
  }

  function calculateFromPrice(pricePerItemCents, quantity, orderFeeCents) {
    const orderTotalCents = pricePerItemCents * quantity;
    const percentageFeeCents = orderTotalCents * PERCENTAGE_FEE;
    const fixedItemFeeCents = FIXED_ITEM_FEE_CENTS * quantity;
    const netReceivedCents = orderTotalCents - percentageFeeCents - fixedItemFeeCents - orderFeeCents;
    return { pricePerItemCents, quantity, orderTotalCents, percentageFeeCents, fixedItemFeeCents, orderFeeCents, netReceivedCents };
  }

  return { calculateFromTarget, calculateFromPrice, parseMoneyToCents, parseQuantity, PERCENTAGE_FEE, FIXED_ITEM_FEE_CENTS };
});

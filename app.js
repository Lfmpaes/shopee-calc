(function () {
  const storageKeys = { feeEnabled: "shopee-calc.order-fee-enabled", feeValue: "shopee-calc.order-fee-value" };
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const elements = {
    priceTab: document.querySelector("#price-tab"), receiveTab: document.querySelector("#receive-tab"), pricePanel: document.querySelector("#price-panel"), receivePanel: document.querySelector("#receive-panel"),
    target: document.querySelector("#target-value"), listed: document.querySelector("#listed-value"), quantity: document.querySelector("#quantity"), feeEnabled: document.querySelector("#order-fee-enabled"), feeValue: document.querySelector("#order-fee-value"), feeValueContainer: document.querySelector(".fee-value"),
    message: document.querySelector("#form-message"), mainLabel: document.querySelector("#main-result-label"), main: document.querySelector("#main-result"), totalLabel: document.querySelector("#total-label"), total: document.querySelector("#total-value"), netLabel: document.querySelector("#net-label"), net: document.querySelector("#net-value"), percentageFee: document.querySelector("#percentage-fee"), itemFee: document.querySelector("#item-fee"), orderFee: document.querySelector("#order-fee")
  };
  let mode = "price";

  function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch { /* The calculator still works without storage. */ } }
  function format(cents) { return currency.format(cents / 100); }
  function clearResult(message, error) {
    elements.message.textContent = message;
    elements.message.classList.toggle("is-error", Boolean(error));
    [elements.main, elements.total, elements.net, elements.percentageFee, elements.itemFee, elements.orderFee].forEach((item) => { item.textContent = "—"; });
  }
  function render(result) {
    elements.percentageFee.textContent = format(result.percentageFeeCents);
    elements.itemFee.textContent = format(result.fixedItemFeeCents);
    elements.orderFee.textContent = format(result.orderFeeCents);
    elements.total.textContent = format(result.orderTotalCents);
    elements.net.textContent = format(result.netReceivedCents);
    elements.message.textContent = "Cálculo atualizado automaticamente.";
    elements.message.classList.remove("is-error");
    if (mode === "price") {
      elements.mainLabel.textContent = "Preço recomendado por item";
      elements.main.textContent = format(result.pricePerItemCents);
      elements.totalLabel.textContent = "Total do pedido";
      elements.netLabel.textContent = "Você receberá";
    } else {
      elements.mainLabel.textContent = "Você receberá no pedido";
      elements.main.textContent = format(result.netReceivedCents);
      elements.totalLabel.textContent = "Total pago pelo cliente";
      elements.netLabel.textContent = "Por item, em média";
      elements.net.textContent = format(result.netReceivedCents / result.quantity);
    }
  }
  function update() {
    const quantity = ShopeeCalculator.parseQuantity(elements.quantity.value);
    const value = ShopeeCalculator.parseMoneyToCents(mode === "price" ? elements.target.value : elements.listed.value);
    const fee = elements.feeEnabled.checked ? ShopeeCalculator.parseMoneyToCents(elements.feeValue.value) : 0;
    if (!value) return clearResult("Informe um valor maior que zero.", Boolean((mode === "price" ? elements.target.value : elements.listed.value).trim()));
    if (!quantity) return clearResult("A quantidade deve ser um número inteiro maior que zero.", true);
    if (elements.feeEnabled.checked && !fee) return clearResult("Informe uma taxa por pedido maior que zero ou desative essa taxa.", true);
    const result = mode === "price" ? ShopeeCalculator.calculateFromTarget(value, quantity, fee) : ShopeeCalculator.calculateFromPrice(value, quantity, fee);
    render(result);
  }
  function setMode(nextMode) {
    mode = nextMode;
    const isPrice = mode === "price";
    elements.priceTab.classList.toggle("is-active", isPrice); elements.receiveTab.classList.toggle("is-active", !isPrice);
    elements.priceTab.setAttribute("aria-selected", String(isPrice)); elements.receiveTab.setAttribute("aria-selected", String(!isPrice));
    elements.pricePanel.hidden = !isPrice; elements.receivePanel.hidden = isPrice;
    update();
  }
  function updateFeeControl() {
    const enabled = elements.feeEnabled.checked;
    elements.feeValue.disabled = !enabled;
    elements.feeValueContainer.classList.toggle("is-disabled", !enabled);
    safeSet(storageKeys.feeEnabled, String(enabled));
    update();
  }

  const savedEnabled = safeGet(storageKeys.feeEnabled); const savedFee = safeGet(storageKeys.feeValue);
  if (savedEnabled !== null) elements.feeEnabled.checked = savedEnabled === "true";
  if (savedFee !== null) elements.feeValue.value = savedFee;
  elements.feeValue.disabled = !elements.feeEnabled.checked; elements.feeValueContainer.classList.toggle("is-disabled", !elements.feeEnabled.checked);
  elements.priceTab.addEventListener("click", () => setMode("price")); elements.receiveTab.addEventListener("click", () => setMode("receive"));
  [elements.target, elements.listed, elements.quantity].forEach((input) => input.addEventListener("input", update));
  elements.feeEnabled.addEventListener("change", updateFeeControl);
  elements.feeValue.addEventListener("input", () => { safeSet(storageKeys.feeValue, elements.feeValue.value); update(); });
  update();
})();

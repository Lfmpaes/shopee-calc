const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateFromTarget, calculateFromPrice, parseMoneyToCents, parseQuantity } = require("../calculator.js");

test("R$ 30,00 anunciado sem taxa por pedido gera R$ 20,00 líquidos", () => {
  const result = calculateFromPrice(3000, 1, 0);
  assert.equal(result.netReceivedCents, 2000);
});

test("meta de R$ 35,00 para um item recomenda R$ 48,75 sem taxa por pedido", () => {
  const result = calculateFromTarget(3500, 1, 0);
  assert.equal(result.pricePerItemCents, 4875);
  assert.equal(result.netReceivedCents, 3500);
});

test("meta de R$ 35,00 para dez itens com taxa de R$ 0,49 recomenda R$ 48,82", () => {
  const result = calculateFromTarget(3500, 10, 49);
  assert.equal(result.pricePerItemCents, 4882);
  assert.ok(result.netReceivedCents >= 3500 * 10);
});

test("a taxa por pedido é aplicada uma única vez", () => {
  const withoutFee = calculateFromPrice(5000, 3, 0);
  const withFee = calculateFromPrice(5000, 3, 49);
  assert.equal(withoutFee.netReceivedCents - withFee.netReceivedCents, 49);
});

test("aceita moeda brasileira e rejeita campos monetários inválidos", () => {
  assert.equal(parseMoneyToCents("1.234,56"), 123456);
  assert.equal(parseMoneyToCents("0"), null);
  assert.equal(parseMoneyToCents("-5"), null);
  assert.equal(parseMoneyToCents("10,999"), null);
  assert.equal(parseMoneyToCents(""), null);
});

test("aceita apenas quantidade inteira positiva", () => {
  assert.equal(parseQuantity("10"), 10);
  assert.equal(parseQuantity("0"), null);
  assert.equal(parseQuantity("1,5"), null);
  assert.equal(parseQuantity("-2"), null);
  assert.equal(parseQuantity(""), null);
});

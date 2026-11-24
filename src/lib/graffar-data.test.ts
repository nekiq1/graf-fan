import assert from "node:assert/strict";
import test from "node:test";
import {
  REVIEWS_YANDEX,
  SERVICE_CATEGORIES,
  defaultStudioData,
  formatExactRub,
  formatRub,
  normalizeDigits,
} from "./graffar-data.ts";

test("defaultStudioData contains verified Graffar contacts and zero fabricated prices", () => {
  const data = defaultStudioData();
  assert.equal(data.settings.brandShort, "ГрафФар");
  assert.equal(data.settings.address, "Санкт-Петербург, Гранитная улица, 51");
  assert.equal(data.settings.phone, "+7 (921) 557-02-83");
  assert.ok(data.services.length >= 9);
  for (const svc of data.services) {
    assert.equal(svc.price, 0);
    assert.ok(SERVICE_CATEGORIES.includes(svc.category));
  }
});

test("price formatting and digit helpers behave deterministically", () => {
  assert.equal(formatRub(0), "По запросу");
  assert.equal(formatExactRub(0), "По запросу");
  assert.match(formatRub(15000), /^от 15\s000 ₽$/);
  assert.equal(normalizeDigits("+7 (921) 557-02-83"), "79215570283");
  assert.equal(REVIEWS_YANDEX.length, 3);
});

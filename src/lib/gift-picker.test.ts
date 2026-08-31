import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PRIORITY_WEIGHT,
  availableGifts,
  matchesBudget,
  selectGift,
  type GiftCandidate,
} from "./gift-picker.ts";

/**
 * Generador determinista: devuelve en orden los valores dados. Así el reparto
 * ponderado se comprueba sin depender del azar (nada de tests probabilísticos).
 */
function seq(...values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

const A: GiftCandidate = { id: "a", priority: "high", price_cents: 5999 };
const B: GiftCandidate = { id: "b", priority: "medium", price_cents: 2500 };
const C: GiftCandidate = { id: "c", priority: "low", price_cents: 12000 };

test("los pesos crecen con la prioridad", () => {
  assert.ok(PRIORITY_WEIGHT.high > PRIORITY_WEIGHT.medium);
  assert.ok(PRIORITY_WEIGHT.medium > PRIORITY_WEIGHT.low);
});

test("la prioridad alta ocupa una banda mayor del sorteo ponderado", () => {
  // Total de pesos = 5 + 3 + 1 = 9. Bandas: A=[0,5), B=[5,8), C=[8,9).
  const items = [A, B, C];
  // threshold = random()*9; se elige el primer item cuyo peso acumulado lo supera.
  const pickAt = (r: number) => {
    const res = selectGift(items, { budget: "any" }, seq(r));
    assert.equal(res.status, "picked");
    return res.status === "picked" ? res.item.id : null;
  };
  assert.equal(pickAt(0), "a"); // 0   -> banda A
  assert.equal(pickAt(4 / 9), "a"); // 4   -> banda A (ancho 5)
  assert.equal(pickAt(6 / 9), "b"); // 6   -> banda B (ancho 3)
  assert.equal(pickAt(8.5 / 9), "c"); // 8.5 -> banda C (ancho 1)
});

test("no elige fuera del rango cuando hay candidatos válidos", () => {
  const items = [A, B, C]; // precios 59,99 / 25,00 / 120,00
  for (const r of [0, 0.2, 0.5, 0.75, 0.999]) {
    const res = selectGift(items, { budget: "under-30" }, seq(r));
    assert.equal(res.status, "picked");
    if (res.status === "picked") {
      assert.equal(res.item.id, "b"); // el único < 30 €
      assert.ok(res.item.price_cents != null && res.item.price_cents < 3000);
    }
  }
});

test("sin candidatos en el rango devuelve 'no-match'", () => {
  const cheap = [B]; // 25,00 €
  assert.equal(selectGift(cheap, { budget: "over-75" }).status, "no-match");
});

test("los deseos reservados/comprados por mí no entran en el sorteo", () => {
  const reserved = new Set(["b"]);
  const pool = availableGifts([A, B, C], reserved);
  assert.deepEqual(
    pool.map((w) => w.id),
    ["a", "c"],
  );
  // Aunque el azar apunte a la banda de B, B ya no está en el conjunto.
  for (const r of [0, 0.4, 0.6, 0.99]) {
    const res = selectGift(pool, { budget: "any" }, seq(r));
    assert.equal(res.status, "picked");
    if (res.status === "picked") assert.notEqual(res.item.id, "b");
  }
});

test("lista vacía devuelve 'empty'", () => {
  assert.equal(selectGift([], { budget: "any" }).status, "empty");
});

test("con un único deseo disponible siempre devuelve ese deseo", () => {
  for (const r of [0, 0.5, 0.999]) {
    const res = selectGift([A], { budget: "any" }, seq(r));
    assert.equal(res.status, "picked");
    if (res.status === "picked") assert.equal(res.item.id, "a");
  }
  // Incluso pidiendo excluir el último: si es el único, se devuelve igualmente.
  const res = selectGift([A], { budget: "any", excludeId: "a" }, seq(0));
  assert.equal(res.status === "picked" && res.item.id, "a");
});

test("no repite de inmediato el mismo deseo si hay alternativas", () => {
  const items = [A, B]; // dos candidatos
  for (const r of [0, 0.3, 0.6, 0.99]) {
    const res = selectGift(items, { budget: "any", excludeId: "a" }, seq(r));
    assert.equal(res.status, "picked");
    if (res.status === "picked") assert.equal(res.item.id, "b");
  }
});

test("los límites de presupuesto no se solapan", () => {
  assert.equal(matchesBudget(2999, "under-30"), true);
  assert.equal(matchesBudget(3000, "under-30"), false);
  assert.equal(matchesBudget(3000, "mid"), true);
  assert.equal(matchesBudget(7500, "mid"), true);
  assert.equal(matchesBudget(7501, "mid"), false);
  assert.equal(matchesBudget(7501, "over-75"), true);
  // Sin precio: sólo entra en "Me da igual".
  assert.equal(matchesBudget(null, "any"), true);
  assert.equal(matchesBudget(null, "mid"), false);
});

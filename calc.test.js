import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  press,
  display,
  multiply,
  formatNumber,
  MAX_INT_DIGITS,
  MAX_FRAC_DIGITS,
} from "./calc.js";

function run(keys, state = initialState()) {
  for (const k of keys) state = press(state, k);
  return state;
}

test("multiply は小数でも誤差なく計算する", () => {
  assert.equal(multiply("1.1", 72), "79.2");
  assert.equal(multiply("1.50", 12), "18");
  assert.equal(multiply("0.001", 12), "0.012");
  assert.equal(multiply("12345678901234567890", 72), "888888880888888888080");
});

test("formatNumber は3桁ごとにカンマを入れる", () => {
  assert.equal(formatNumber("1234567"), "1,234,567");
  assert.equal(formatNumber("1234.5678"), "1,234.5678");
  assert.equal(formatNumber("123"), "123");
  assert.equal(formatNumber("1000", true), "-1,000");
  assert.equal(formatNumber("12."), "12.");
});

test("数字 → ×12 → = で12倍", () => {
  assert.equal(display(run(["5", "×12", "="])), "60");
});

test("= の前に押し直した倍率が使われる", () => {
  assert.equal(display(run(["5", "×12", "×72", "="])), "360");
});

test("結果に続けて掛けられる", () => {
  assert.equal(display(run(["5", "×12", "=", "×72", "="])), "4,320");
});

test("倍率なしの = は何もしない", () => {
  assert.equal(display(run(["5", "×12", "=", "="])), "60");
});

test("結果表示中の数字は新しい入力になる", () => {
  assert.equal(display(run(["5", "×12", "=", "7"])), "7");
});

test("* は奇数回で12倍、偶数回で72倍", () => {
  assert.equal(display(run(["2", "*", "="])), "24");
  assert.equal(display(run(["2", "*", "*", "="])), "144");
  assert.equal(display(run(["2", "*", "*", "*", "="])), "24");
});

test("数字入力で * の回数はリセットされる", () => {
  const s = run(["2", "*", "3"]);
  assert.equal(s.starCount, 0);
  assert.equal(s.pending, null);
  assert.equal(display(run(["*", "="], s)), "276");
});

test("± で符号が切り替わる", () => {
  assert.equal(display(run(["5", "±", "×12", "="])), "-60");
  assert.equal(display(run(["5", "×12", "=", "±"])), "-60");
  assert.equal(display(run(["5", "±", "±"])), "5");
});

test("小数点の入力", () => {
  assert.equal(display(run([".", "5"])), "0.5");
  assert.equal(display(run(["1", ".", ".", "5"])), "1.5");
  assert.equal(display(run(["1", ".", "×12", "="])), "12");
});

test("入力桁数の上限", () => {
  const s = run(Array(MAX_INT_DIGITS + 5).fill("9"));
  assert.equal(s.text.length, MAX_INT_DIGITS);
  const f = run(["0", ".", ...Array(MAX_FRAC_DIGITS + 5).fill("1")]);
  assert.equal(f.text.split(".")[1].length, MAX_FRAC_DIGITS);
});

test("上限を超えると E になり C 以外を受け付けない", () => {
  let s = run(["1"]);
  while (!s.error) s = run(["×72", "="], s);
  assert.equal(display(s), "E");
  assert.equal(display(run(["5", "×12", "="], s)), "E");
  assert.equal(display(run(["C"], s)), "0");
});

test("ちょうど100桁は許容される", () => {
  // 1 の後に 0 が 98 個（99桁）× 12 = 100桁
  const s = run(["1", ...Array(MAX_INT_DIGITS - 2).fill("0"), "×12", "="]);
  assert.equal(s.error, false);
  assert.equal(s.text.length, MAX_INT_DIGITS);
  assert.equal(run(["×12", "="], s).error, true);
});

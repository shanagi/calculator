export const MAX_INT_DIGITS = 100;
export const MAX_FRAC_DIGITS = 20;

export function initialState() {
  return {
    text: "0", // 符号なしの数値文字列（入力途中の "12." も含む）
    negative: false,
    fresh: true, // 次の数字入力で表示を置き換えるか
    pending: null, // 12 | 72 | null
    starCount: 0,
    error: false,
  };
}

function intPart(text) {
  return text.split(".")[0];
}

function fracPart(text) {
  return text.split(".")[1] ?? "";
}

// 符号なし十進文字列に整数 k を掛ける。誤差なしで計算する。
export function multiply(text, k) {
  const frac = fracPart(text);
  const digits = BigInt(intPart(text) + frac);
  let s = (digits * BigInt(k)).toString();
  if (frac.length === 0) return s;
  s = s.padStart(frac.length + 1, "0");
  const i = s.slice(0, -frac.length);
  const f = s.slice(-frac.length).replace(/0+$/, "");
  return f ? `${i}.${f}` : i;
}

function isZero(text) {
  return /^[0.]*$/.test(text);
}

export function press(state, key) {
  if (state.error) {
    return key === "C" ? initialState() : state;
  }
  switch (key) {
    case "C":
      return initialState();
    case "±":
      return { ...state, negative: !state.negative };
    case "×12":
      return { ...state, pending: 12, starCount: 1 };
    case "×72":
      return { ...state, pending: 72, starCount: 2 };
    case "*": {
      const starCount = state.starCount + 1;
      return { ...state, starCount, pending: starCount % 2 === 1 ? 12 : 72 };
    }
    case "=":
      return evaluate(state);
    case ".":
      return inputDot(state);
    default:
      if (/^[0-9]$/.test(key)) return inputDigit(state, key);
      return state;
  }
}

function startInput(state) {
  if (!state.fresh) return { ...state, pending: null, starCount: 0 };
  return { ...initialState(), fresh: false };
}

function inputDigit(state, d) {
  const next = startInput(state);
  const { text } = next;
  if (text.includes(".")) {
    if (fracPart(text).length >= MAX_FRAC_DIGITS) return next;
    return { ...next, text: text + d };
  }
  if (text === "0") return { ...next, text: d };
  if (text.length >= MAX_INT_DIGITS) return next;
  return { ...next, text: text + d };
}

function inputDot(state) {
  const next = startInput(state);
  if (next.text.includes(".")) return next;
  return { ...next, text: next.text + "." };
}

function evaluate(state) {
  if (state.pending === null) return state;
  const text = multiply(state.text.replace(/\.$/, ""), state.pending);
  if (intPart(text).length > MAX_INT_DIGITS) {
    return { ...initialState(), error: true };
  }
  return {
    ...initialState(),
    text,
    negative: state.negative && !isZero(text),
  };
}

// 整数部を3桁ごとにカンマ区切りにする
export function formatNumber(text, negative = false) {
  const [i, f] = text.split(".");
  const grouped = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = f === undefined ? grouped : `${grouped}.${f}`;
  return negative ? `-${body}` : body;
}

export function display(state) {
  if (state.error) return "E";
  return formatNumber(state.text, state.negative);
}

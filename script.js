import { initialState, press, display } from "./calc.js";

const MAX_FONT = 56;
const MIN_FONT = 20;

const displayEl = document.getElementById("display");
const opButtons = document.querySelectorAll(".op");
let state = initialState();

// 1行に収まる最大の文字サイズを探し、最小サイズでも収まらなければ折り返す
function fit() {
  displayEl.classList.remove("wrap");
  let size = MAX_FONT;
  displayEl.style.fontSize = `${size}px`;
  while (size > MIN_FONT && displayEl.scrollWidth > displayEl.clientWidth) {
    size -= 2;
    displayEl.style.fontSize = `${size}px`;
  }
  if (displayEl.scrollWidth > displayEl.clientWidth) {
    displayEl.classList.add("wrap");
  }
}

function render() {
  displayEl.textContent = display(state);
  for (const b of opButtons) {
    b.classList.toggle("active", state.pending === Number(b.dataset.key.slice(1)));
  }
  fit();
}

function handle(key) {
  state = press(state, key);
  render();
}

document.querySelector(".keys").addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (button) handle(button.dataset.key);
});

const keyMap = {
  Enter: "=",
  "=": "=",
  Escape: "C",
  "-": "±",
  "*": "*",
  ".": ".",
};

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const key = /^[0-9]$/.test(e.key) ? e.key : keyMap[e.key];
  if (!key) return;
  e.preventDefault();
  handle(key);
});

window.addEventListener("resize", fit);
render();

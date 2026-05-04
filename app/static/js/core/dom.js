export function $(selector) {
  return document.querySelector(selector);
}

export function setText(selector, value) {
  const el = $(selector);
  if (el) el.innerText = value ?? "-";
}
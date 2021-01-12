// ==UserScript==
// @name        Feedly Colorful Listview
// @namespace   http://feedly.colorful.list.view
// @description Colorizes items headers based on their source
// @include     http*://feedly.com/*
// @include     http*://*.feedly.com/*
// @version     0.11.0
// ==/UserScript==

const colors = {};

// since GM_addStyle was deprecated - use custom function
// that simply appends styles to head of the document
const addStyle = styleText => {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(styleText));
  document.head.appendChild(style);
};

const computeColor = (title) => {
  let h = 0;

  for (let i = 0; i < title.length; i++) {
    let s = i !== 0 ? title.length % i : 1;
    let r = s !== 0 ? title.charCodeAt(i) % s : title.charCodeAt(i);
    h += r;
  }

  let hs = {
    h: (h % 36 + 1) * 10,
    s: 30 + (h % 5 + 1) * 10,
  };

  colors[title] = hs;

  return hs;
};

addStyle(`
  .entry { border-color: transparent !important; }
  .entry .ago { color: #444 !important; }
  .entry .source { color: #444 !important; font-weight: bold !important; }
  #timeline div.selected { border: 1px solid #444 !important; }
  .theme--dark .fx .entry .title { color: rgba(0, 0, 0, 0.88)!important; }
  .theme--dark .fx .entry.read .title { color: rgba(0, 0, 0, .54)!important; }
  .theme--dark .fx .entry.u0 { background: #f3f1f1; }
  .theme--dark .fx .entry .entry__title { color: #000; }
  .theme--dark .fx .entry.entry--read .entry__title { color: rgb(0 0 0 / 44%); }
`);

const timeline = document.getElementById("box");
timeline.addEventListener("DOMNodeInserted", function () {
  const elements = document.getElementsByClassName('entry');
  Array
    .from(elements)
    .filter(el => !el.getAttribute('colored'))
    .filter(el => el.querySelector("a.source"))
    .map(el => {
      const title = el.querySelector("a.source").textContent;
      el.setAttribute("colored", title);
      return title;
    })
    .forEach((title) => {
      if (!colors[title]) {
        const color = computeColor(title);
        addStyle(`
          div[colored='${title}'] {
            background: hsl(${color.h},${color.s}%,80%) !important; }
          div[colored='${title}']:hover {
            background: hsl(${color.h},${color.s}%,85%) !important; }
          div[colored='${title}']//a[contains(@class, 'read')] {
            background: hsl(${color.h},${color.s}%,90%) !important; }
          div[colored='${title}']//a[contains(@class, 'read')]:hover {
            background: hsl(${color.h},${color.s}%,95%) !important; }
        `);
      }
    });
}, false);

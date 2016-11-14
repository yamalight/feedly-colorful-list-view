// ==UserScript==
// @name        Feedly Colorful Listview
// @namespace   http://feedly.colorful.list.view
// @description Colorizes items headers based on their source
// @include     http*://feedly.com/*
// @include     http*://*.feedly.com/*
// @version     0.8.0
// @grant       GM_addStyle
// ==/UserScript==

const colors = {};

const computeColor = (title) => {
  let h = 0;

  for (let c in title) {
    h += c.charCodeAt(0);
  }

  let hs = {
    h: (h % 36 + 1) * 10,
    s: 30 + (h % 5 + 1) * 10,
  };

  colors[title] = hs;

  return hs;
};

GM_addStyle(`
  .entry { border-color: transparent !important; }
  .entry .ago { color: #444 !important; }
  .entry .source { color: #444 !important; font-weight: bold !important; }
  #timeline div.selected { border: 1px solid #444 !important; }
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
        GM_addStyle(`
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
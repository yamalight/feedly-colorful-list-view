// ==UserScript==
// @name        Feedly Colorful Listview
// @namespace   http://feedly.colorful.list.view
// @description Colorizes items headers based on their source
// @include     http*://feedly.com/*
// @include     http*://*.feedly.com/*
// @version     0.11.8
// ==/UserScript==

const colors = {};

// since GM_addStyle was deprecated - use custom function
// that simply appends styles to head of the document
const addStyle = (styleText) => {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(styleText));
  document.head.appendChild(style);
};

// replaces all non-letters (utf-8) to cleanup the string for coloring
// fixes https://github.com/yamalight/feedly-colorful-list-view/issues/2
const cleanTitle = (title) => {
  return title?.replace?.(/[^\p{L}\s]/gu, '');
};

const computeColor = (title) => {
  let h = 0;

  for (let i = 0; i < title.length; i++) {
    let s = i !== 0 ? title.length % i : 1;
    let r = s !== 0 ? title.charCodeAt(i) % s : title.charCodeAt(i);
    h += r;
  }

  let hs = {
    h: ((h % 36) + 1) * 10,
    s: 30 + ((h % 5) + 1) * 10,
  };

  colors[title] = hs;

  return hs;
};

addStyle(`
  .entry { border-color: transparent !important; }
  .entry .ago { color: #444 !important; }
  .entry .EntryMetadataSource--title-only { color: #444 !important; font-weight: bold !important; }
  #timeline div.selected { border: 1px solid #444 !important; }
  .theme--dark .entry--selected > * { background: inherit !important; }
  .theme--dark .fx .entry .TitleOnlyEntry:hover { background: inherit !important; }
  .theme--dark .fx .entry .TitleOnlyEntry { border: transparent !important; }
  .theme--dark .fx .entry .EntryTitle { color: rgba(0, 0, 0, 0.88)!important; }
  .theme--dark .fx .entry .EntryMetadataSource--title-only { color: rgba(0, 0, 0, 0.75)!important; }
  .theme--dark .fx .entry.entry--read .EntryMetadataSource--title-only { color: rgba(0, 0, 0, .54)!important; font-weight: normal!important; }
  .theme--dark .fx .entry.entry--read .EntryTitle { color: rgba(0, 0, 0, .54)!important; font-weight: normal!important; }
  .theme--dark .fx .entry { color: rgba(0, 0, 0, .54)!important; }
  .theme--dark .fx .entry .EntryTitle { color: #000; }
`);

const timeline = document.getElementById('root');
timeline.addEventListener(
  'DOMNodeInserted',
  function () {
    const elements = document.getElementsByClassName('entry');
    Array.from(elements)
      .filter((el) => !el.getAttribute('colored'))
      .filter((el) => el.querySelector('a.EntryMetadataSource'))
      .map((el) => {
        const title = cleanTitle(
          el.querySelector('a.EntryMetadataSource').textContent
        );
        el.setAttribute('colored', title);
        return title;
      })
      .forEach((title) => {
        if (!colors[title]) {
          const color = computeColor(title);
          addStyle(`
          article[colored='${title}'] {
            background: hsl(${color.h},${color.s}%,80%) !important; }
          article[colored='${title}']:hover {
            background: hsl(${color.h},${color.s}%,85%) !important; }
          article[colored='${title}']//a[contains(@class, 'read')] {
            background: hsl(${color.h},${color.s}%,90%) !important; }
          article[colored='${title}']//a[contains(@class, 'read')]:hover {
            background: hsl(${color.h},${color.s}%,95%) !important; }
        `);
        }
      });
  },
  false
);

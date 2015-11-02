// ==UserScript==
// @name        Feedly Colorful Listview
// @namespace   http://feedly.colorful.list.view
// @description Colorizes items headers based on their source
// @include     http*://feedly.com/*
// @include     http*://*.feedly.com/*
// @version     0.5
// @grant       GM_addStyle
// ==/UserScript==

var colors = {};

function computeColor(title) {
    var h = 0;

    for (var c in title) {
        h += c.charCodeAt(0);
    }
    h = h % 360;

    colors[title] = h;

    return h;
}

(function() {
    GM_addStyle(
        ".u0Entry { border-color: transparent !important; }" +
        ".u0Entry .lastModified { color: #444 !important; }" +
        ".u0Entry .sourceTitle a { color: #444 !important; font-weight: bold !important; }" +
        "#timeline div.selectedEntry { border: 1px solid #444 !important; }");

    var timeline = document.getElementById("box");
    timeline.addEventListener("DOMNodeInserted", function() {
        var elements = document.getElementsByClassName('u0Entry');
        Array.from(elements)
        .filter(function(el) {
            return !el.getAttribute('colored');
        })
        .forEach(function(el) {
            var title = el.querySelector("span.sourceTitle a").textContent;
            title = title.replace(/\W/g, "-");

            el.setAttribute("colored", title);

            if (!colors[title]) {
                var color = computeColor(title);
                GM_addStyle(
                    "div[colored='" + title + "'] {" +
                    "   background: hsl(" + color + ",70%,80%) !important; }" +
                    "div[colored='" + title + "']:hover {" +
                    "   background: hsl(" + color + ",90%,85%) !important; }" +
                    "div[colored='" + title + "']//a[contains(@class, 'read')] {" +
                    "   background: hsl(" + color + ",70%,90%) !important; }" +
                   "div[colored='" + title + "']//a[contains(@class, 'read')]:hover {" +
                    "   background: hsl(" + color + ",90%,95%) !important; }");
            }
        });
    }, false);

})();
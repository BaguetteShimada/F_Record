const assert = require("assert");
const fs = require("fs");
const path = require("path");

const layoutCss = fs.readFileSync(path.join(__dirname, "..", "src", "panel", "panelLayout.css"), "utf8");

assert.ok(layoutCss.includes("--fr-color-canvas: var(--fr-color-neutral-800)"));
assert.ok(layoutCss.includes("--fr-space-3: 12px"));
assert.ok(layoutCss.includes("--fr-section-padding: var(--fr-space-3)"));
assert.ok(layoutCss.includes("--fr-card-bg: var(--fr-color-surface)"));
assert.ok(layoutCss.includes(".fr-panel-page"));
assert.ok(layoutCss.includes(".fr-panel-section"));
assert.ok(layoutCss.includes("row-gap: var(--fr-section-gap)"));
assert.ok(layoutCss.includes("padding: 0 var(--fr-space-2) var(--fr-panel-bottom)"));
assert.ok(layoutCss.includes(".fr-field-row"));
assert.ok(layoutCss.includes(".fr-primary-action"));
assert.ok(layoutCss.includes("*::-webkit-scrollbar-corner"));
assert.ok(layoutCss.includes("*::-webkit-resizer"));
assert.ok(layoutCss.includes("resize: none !important"));
assert.ok(layoutCss.includes("display: none !important"));
assert.ok(layoutCss.includes("opacity: 0 !important"));
assert.ok(!layoutCss.includes(".fr-panel-shell::after"));
assert.ok(!layoutCss.includes("z-index: 2147483647"));
assert.ok(layoutCss.includes("overflow-x: hidden"));
assert.ok(layoutCss.includes("@media (max-width: 420px)"));

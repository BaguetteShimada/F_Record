const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rowSource = fs.readFileSync(path.join(__dirname, "..", "src", "panel", "SettingsPickerRow.tsx"), "utf8");
const layoutCss = fs.readFileSync(path.join(__dirname, "..", "src", "panel", "panelLayout.css"), "utf8");

assert.ok(rowSource.includes('className="fr-field-row fr-settings-row"'));
assert.ok(rowSource.includes('className="fr-field-label fr-settings-label"'));
assert.ok(rowSource.includes('UNSAFE_className="fr-control-picker fr-settings-picker"'));
assert.ok(layoutCss.includes(".fr-control-picker"));
assert.ok(layoutCss.includes(".fr-settings-picker"));
assert.ok(layoutCss.includes('[class*="spectrum-Dropdown-trigger"]'));
assert.ok(layoutCss.includes('[class*="spectrum-Dropdown-label"]'));
assert.ok(layoutCss.includes("--fr-control-height: 34px"));
assert.ok(layoutCss.includes("height: var(--fr-control-height)"));
assert.ok(layoutCss.includes("--fr-picker-width: 152px"));
assert.ok(layoutCss.includes("::before"));
assert.ok(layoutCss.includes('[class*="spectrum-Dropdown-chevron"]'));
assert.ok(layoutCss.includes("display: none !important"));
assert.ok(layoutCss.includes("width: 100% !important"));

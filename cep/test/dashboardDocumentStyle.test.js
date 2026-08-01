const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rowSource = fs.readFileSync(path.join(__dirname, "..", "src", "panel", "DashboardDocumentRow.tsx"), "utf8");
const layoutCss = fs.readFileSync(path.join(__dirname, "..", "src", "panel", "panelLayout.css"), "utf8");

assert.ok(rowSource.includes('className="fr-field-row fr-data-row"'));
assert.ok(rowSource.includes('className="fr-field-label fr-row-label"'));
assert.ok(rowSource.includes('className="fr-field-control fr-control-group fr-document-value"'));
assert.ok(rowSource.includes('UNSAFE_className="fr-control-field fr-document-name-field"'));
assert.ok(rowSource.includes('UNSAFE_className="fr-icon-button fr-document-folder-button"'));
assert.ok(layoutCss.includes(".fr-document-name-field"));
assert.ok(layoutCss.includes("--fr-wide-control-width: 336px"));
assert.ok(layoutCss.includes(".fr-control-group > :first-child"));
assert.ok(layoutCss.includes("max-inline-size: var(--fr-wide-control-width)"));
assert.ok(layoutCss.includes('[class*="spectrum-Textfield"]'));
assert.ok(layoutCss.includes(".fr-icon-button"));

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const sectionSource = fs.readFileSync(path.join(__dirname, "..", "src", "panel", "SettingsFolderSection.tsx"), "utf8");
const layoutCss = fs.readFileSync(path.join(__dirname, "..", "src", "panel", "panelLayout.css"), "utf8");

assert.ok(sectionSource.includes('className="fr-panel-section fr-settings-section fr-settings-folder-section"'));
assert.ok(sectionSource.includes('className="fr-field-row fr-settings-row"'));
assert.ok(sectionSource.includes('className="fr-field-control fr-control-group fr-settings-folder-row"'));
assert.ok(sectionSource.includes('UNSAFE_className="fr-control-field fr-settings-folder-field"'));
assert.ok(sectionSource.includes('UNSAFE_className="fr-icon-button fr-settings-folder-button"'));
assert.ok(layoutCss.includes(".fr-settings-folder-button"));
assert.ok(layoutCss.includes(".fr-settings-folder-section .fr-settings-row"));
assert.ok(layoutCss.includes("min-inline-size: var(--fr-control-height)"));
assert.ok(layoutCss.includes("block-size: var(--fr-control-height)"));
assert.ok(layoutCss.includes(".fr-control-group > :first-child"));
assert.ok(layoutCss.includes("flex: 0 0 var(--fr-control-height) !important"));
assert.ok(layoutCss.includes("max-inline-size: var(--fr-wide-control-width)"));

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const vm = require("vm");

function loadExternalLinksModule() {
    const modulePath = path.join(__dirname, "..", "src", "panel", "externalLinks.ts");
    const source = fs.readFileSync(modulePath, "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2018,
        },
    });

    const module = { exports: {} };
    const context = {
        module,
        exports: module.exports,
    };
    vm.runInNewContext(compiled.outputText, context, { filename: modulePath });
    return module.exports;
}

const { GITHUB_REPOSITORY_URL, openExternalUrl } = loadExternalLinksModule();

assert.strictEqual(GITHUB_REPOSITORY_URL, "https://github.com/BaguetteShimada/F_Record");

const openedUrls = [];
openExternalUrl(GITHUB_REPOSITORY_URL, () => {
    throw new Error("Unexpected error callback");
}, {
    openURLInDefaultBrowser(url) {
        openedUrls.push(url);
    },
});

assert.deepStrictEqual(openedUrls, [GITHUB_REPOSITORY_URL]);

const expectedError = new Error("Cannot open browser");
const errors = [];
openExternalUrl(GITHUB_REPOSITORY_URL, (error) => {
    errors.push(error);
}, {
    openURLInDefaultBrowser() {
        throw expectedError;
    },
});

assert.deepStrictEqual(errors, [expectedError]);

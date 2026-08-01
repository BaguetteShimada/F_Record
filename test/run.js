const { runListedNodeTests } = require("../scripts/nodeTestRunner");

const testFiles = [
    "projectRunner.test.js",
    "workspaceLockfile.test.js",
    "ciWorkflow.test.js",
    "releaseWorkflow.test.js",
    "releaseVersion.test.js",
    "build.test.js",
    "communityReferences.test.js",
    "runNodeScript.test.js",
    "photoshop2025Compatibility.test.js",
    "installPhotoshopPluginScript.test.js",
];

runListedNodeTests({
    testDir: __dirname,
    testFiles,
});

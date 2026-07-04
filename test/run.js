const { runListedNodeTests } = require("../scripts/nodeTestRunner");

const testFiles = [
    "projectRunner.test.js",
    "build.test.js",
    "communityReferences.test.js",
];

runListedNodeTests({
    testDir: __dirname,
    testFiles,
});

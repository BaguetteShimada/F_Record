const {
    runProjectInstall,
    runProjectScript,
} = require("./scripts/projectRunner");

function main() {
    runProjectInstall("cep");
    runProjectInstall("generator");

    runProjectScript("cep", "test");
    runProjectScript("cep", "typecheck");
    runProjectScript("cep", "build");

    runProjectScript("generator", "test");
    runProjectScript("generator", "build");
}

main();

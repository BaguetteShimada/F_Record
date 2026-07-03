const path = require("path");
const { execFileSync, execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");

function runProjectInstall(projectName) {
    runPackageManager(projectName, ["install"]);
}

function runProjectScript(projectName, scriptName) {
    runPackageManager(projectName, ["run", scriptName]);
}

function runPackageManager(projectName, args) {
    const packageManager = detectPackageManager(process.env.npm_config_user_agent || "");
    const projectDir = path.join(rootDir, projectName);
    const commandArgs = createPackageManagerArgs(packageManager, projectDir, args);

    execCommand(packageManager, commandArgs);
}

function detectPackageManager(userAgent) {
    if (/pnpm/i.test(userAgent)) {
        return "pnpm";
    }
    if (/yarn/i.test(userAgent)) {
        return "yarn";
    }
    return "npm";
}

function createPackageManagerArgs(packageManager, projectDir, args) {
    if (packageManager === "pnpm") {
        return ["--dir", projectDir].concat(args);
    }
    if (packageManager === "yarn") {
        return ["--cwd", projectDir].concat(args);
    }
    return ["--prefix", projectDir].concat(args);
}

function execCommand(command, args) {
    if (process.platform === "win32") {
        const commandLine = [command].concat(args.map(quoteCmdArgument)).join(" ");
        execSync(commandLine, {
            cwd: rootDir,
            stdio: "inherit",
        });
        return;
    }
    execFileSync(command, args, {
        cwd: rootDir,
        stdio: "inherit",
    });
}

function quoteCmdArgument(value) {
    return `"${String(value).replace(/"/g, '\\"')}"`;
}

module.exports = {
    createPackageManagerArgs,
    detectPackageManager,
    rootDir,
    runProjectInstall,
    runProjectScript,
};

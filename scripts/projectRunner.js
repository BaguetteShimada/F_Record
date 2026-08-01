const path = require("path");
const fs = require("fs");
const { execFileSync, execSync } = require("child_process");
const rootPackageJson = require("../package.json");

const rootDir = path.resolve(__dirname, "..");

function runProjectInstall(projectName) {
    runPackageManager(projectName, ["install"], { frozenLockfile: true });
}

function runProjectScript(projectName, scriptName) {
    runPackageManager(projectName, ["run", scriptName]);
}

function runPackageManager(projectName, args, options) {
    const packageManager = selectPackageManager(
        process.env.npm_config_user_agent,
        rootPackageJson.packageManager,
    );
    const invocation = resolvePackageManagerInvocation(packageManager, process.env, process.execPath);
    const projectDir = path.join(rootDir, projectName);
    const commandArgs = createPackageManagerArgs(packageManager, projectDir, args, options);

    execCommand(invocation.command, invocation.prefixArgs.concat(commandArgs));
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

function selectPackageManager(userAgent, configuredPackageManager) {
    return detectPackageManager(userAgent || configuredPackageManager || "");
}

function createPackageManagerArgs(packageManager, projectDir, args, options) {
    const commandArgs = args.slice();
    if (
        options &&
        options.frozenLockfile === true &&
        packageManager === "pnpm" &&
        args[0] === "install"
    ) {
        commandArgs.push("--frozen-lockfile");
    }
    if (packageManager === "pnpm") {
        return ["--dir", projectDir].concat(commandArgs);
    }
    if (packageManager === "yarn") {
        return ["--cwd", projectDir].concat(commandArgs);
    }
    return ["--prefix", projectDir].concat(commandArgs);
}

function resolvePackageManagerInvocation(packageManager, env, nodeExecPath) {
    const npmExecPath = env.npm_execpath;
    if (isMatchingPackageManagerPath(npmExecPath, packageManager)) {
        if (isJavaScriptCliPath(npmExecPath) && typeof nodeExecPath === "string") {
            return createInvocation(nodeExecPath, [npmExecPath]);
        }
        if (canExecutePackageManagerPathDirectly(npmExecPath)) {
            return createInvocation(npmExecPath);
        }
    }

    const bundledCliPath = resolveBundledPackageManagerCli(packageManager, nodeExecPath);
    if (bundledCliPath !== null) {
        return createInvocation(nodeExecPath, [bundledCliPath]);
    }
    return createInvocation(packageManager);
}

function createInvocation(command, prefixArgs = []) {
    return { command, prefixArgs };
}

function isMatchingPackageManagerPath(commandPath, packageManager) {
    return (
        typeof commandPath === "string" &&
        commandPath.toLowerCase().includes(packageManager.toLowerCase())
    );
}

function isJavaScriptCliPath(commandPath) {
    return /\.(cjs|mjs|js)$/i.test(commandPath);
}

function canExecutePackageManagerPathDirectly(commandPath) {
    if (process.platform !== "win32") {
        return true;
    }
    return /\.(cmd|bat|exe)$/i.test(commandPath);
}

function resolveBundledPackageManagerCli(packageManager, nodeExecPath) {
    if (packageManager !== "pnpm" || typeof nodeExecPath !== "string") {
        return null;
    }

    const nodeDir = path.dirname(nodeExecPath);
    const candidatePaths = [
        path.resolve(nodeDir, "..", "node_modules", "pnpm", "bin", "pnpm.cjs"),
        path.resolve(nodeDir, "..", "node_modules", "pnpm", "bin", "pnpm.mjs"),
        path.resolve(nodeDir, "node_modules", "pnpm", "bin", "pnpm.cjs"),
        path.resolve(nodeDir, "node_modules", "pnpm", "bin", "pnpm.mjs"),
    ];
    return candidatePaths.find(candidatePath => fs.existsSync(candidatePath)) || null;
}

function execCommand(command, args) {
    if (process.platform === "win32" && !/\.(exe|com)$/i.test(command)) {
        const commandLine = [quoteCmdExecutable(command)].concat(args.map(quoteCmdArgument)).join(" ");
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

function quoteCmdExecutable(value) {
    const command = String(value);
    return /[\s&|<>^]/.test(command) ? quoteCmdArgument(command) : command;
}

function quoteCmdArgument(value) {
    return `"${String(value).replace(/"/g, '\\"')}"`;
}

module.exports = {
    createPackageManagerArgs,
    detectPackageManager,
    quoteCmdExecutable,
    resolvePackageManagerInvocation,
    rootDir,
    runProjectInstall,
    runProjectScript,
    selectPackageManager,
};

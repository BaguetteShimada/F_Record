const { execFile } = require('child_process');

function createOpenLocalPathCommand(targetPath, platform = process.platform) {
    if (platform === 'win32') {
        return {
            file: 'rundll32.exe',
            args: ['url.dll,FileProtocolHandler', targetPath],
        };
    }
    return {
        file: 'open',
        args: [targetPath],
    };
}

function openLocalPathWithExecFile(targetPath, options = {}) {
    const execFileFn = options.execFile || execFile;
    const platform = options.platform || process.platform;
    const command = createOpenLocalPathCommand(targetPath, platform);
    execFileFn(command.file, command.args);
}

module.exports = {
    createOpenLocalPathCommand,
    openLocalPathWithExecFile,
};

const fs = require("fs");
const path = require('path');
const writeFileAtomic = require('write-file-atomic');

function getPanelScriptPath(fileName) {
    const candidates = [
        path.join(__dirname, 'js', fileName),
        path.join(__dirname, fileName),
    ];
    for (let i = 0; i < candidates.length; i++) {
        if (fs.existsSync(candidates[i])) {
            return candidates[i];
        }
    }
    return candidates[0];
}

const { openLocalPathWithExecFile } = require(getPanelScriptPath('localPathOpener.js'));
const { runExportReplayWorker } = require(getPanelScriptPath('exportReplayWorker.js'));
const { resolveExportBinaries } = require(getPanelScriptPath('exportReplayUtils.js'));
const cs = new CSInterface();


function getUserDirectory() {
    if (process.platform === 'win32') {
        return path.join(process.env["USERPROFILE"], 'AppData', 'Roaming');
    } else {
        return path.join(process.env["HOME"], 'Library', 'Application Support');
    }
}

function isExist(path) {
    return fs.existsSync(path);
}

function createDir(path) {
    fs.mkdirSync(path, { recursive: true });
}

function writeFile(path, content) {
    writeFileAtomic.sync(path, content);
}

function readFile(path) {
    return fs.readFileSync(path, 'utf8');
}

function readDir(path) {
    return fs.readdirSync(path);
}

function unlinkFile(path) {
    fs.unlinkSync(path);
}

function deleteDir(path) {
    fs.rmSync(path, { recursive: true, force: true });
}

function openLocalPath(path) {
    openLocalPathWithExecFile(path);
}

function showError(error) {
    const errorProperties = Object.getOwnPropertyNames(error).reduce((acc, key) => {
        acc[key] = error[key];
        return acc;
    }, {});
    const script = "$.f_record.showError('" + encodeURIComponent(JSON.stringify(errorProperties, null, 2)).replace(/[!'()*]/g, c => 
        '%' + c.charCodeAt(0).toString(16).toUpperCase()
    ) + "')";
    cs.evalScript(script);
}

function persistentPanel() {
    const extensionId = cs.getExtensionID();
    const appId = cs.getApplicationID();
    const event = new CSEvent();
    event.type = "com.adobe.PhotoshopPersistent";
    event.appId = appId;
    event.extensionId = extensionId;
    event.scope = "APPLICATION";
    event.data = {};
    cs.dispatchEvent(event);
}

function validateExportBinaries() {
    resolveExportBinaries();
}

async function exportReplay(exportParams, onProgress) {
    return runExportReplayWorker(exportParams, onProgress, {
        workerPath: getPanelScriptPath('exportReplay.js'),
    });
}

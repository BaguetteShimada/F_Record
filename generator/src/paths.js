const path = require("path");

function getUserDirectory() {
    if (process.platform === "win32") {
        return path.join(process.env["USERPROFILE"], "AppData", "Roaming");
    }
    return path.join(process.env["HOME"], "Library", "Application Support");
}

const F_Record_Dir = path.join(getUserDirectory(), "F_Record");
const configDataFilePath = path.join(F_Record_Dir, "configData.json");
const nowDocumentFilePath = path.join(F_Record_Dir, "nowDocument.json");
const documentValueFolderPath = path.join(F_Record_Dir, "documentValues");

function getDocumentValueFilePath(documentCreateTime) {
    return path.join(documentValueFolderPath, `${documentCreateTime}.json`);
}

module.exports = {
    F_Record_Dir,
    configDataFilePath,
    nowDocumentFilePath,
    documentValueFolderPath,
    getDocumentValueFilePath,
    getUserDirectory,
};

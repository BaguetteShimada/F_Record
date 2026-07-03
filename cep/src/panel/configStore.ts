import path from 'path-browserify';
import { configDataFilePath, F_Record_Dir } from './constants';
import { normalizeConfigData } from './models';
import type { ConfigData } from './models';
import { ensureDirectory, readDirectory, readJsonFile, removeFileIfExists, writeJsonFile } from './storage';

const atomicConfigFilePrefix = "configData.json.";

export function loadConfigData(fallback: ConfigData): ConfigData {
    ensureDirectory(F_Record_Dir);
    pruneAtomicConfigTempFiles();
    return normalizeConfigData(readJsonFile(configDataFilePath), fallback);
}

export function saveConfigData(configData: ConfigData): void {
    ensureDirectory(F_Record_Dir);
    writeJsonFile(configDataFilePath, configData);
}

function pruneAtomicConfigTempFiles(): void {
    const configDataFiles = readDirectory(F_Record_Dir);
    for (const file of configDataFiles) {
        if (file.startsWith(atomicConfigFilePrefix)) {
            removeFileIfExists(path.join(F_Record_Dir, file));
        }
    }
}

import path from 'path-browserify';
import { documentValueFolderPath, nowDocumentFilePath } from './constants';
import { createDefaultCurrentDocumentValue, normalizeCurrentDocumentValue } from './models';
import type { ConfigData, CurrentDocumentValue } from './models';
import { pathExists, readDirectory, readJsonFile, removeFileIfExists } from './storage';

export function clearNowDocument(): void {
    removeFileIfExists(nowDocumentFilePath);
}

export function loadCurrentDocumentValue(configData: ConfigData): CurrentDocumentValue {
    let documentValue = createDefaultCurrentDocumentValue();

    if (!pathExists(nowDocumentFilePath)) {
        return documentValue;
    }

    documentValue = normalizeCurrentDocumentValue(readJsonFile(nowDocumentFilePath), documentValue);
    if (!documentValue.createTime) {
        return createDefaultCurrentDocumentValue();
    }

    const documentValueFilePath = path.join(documentValueFolderPath, `${documentValue.createTime}.json`);
    if (!pathExists(documentValueFilePath)) {
        return createDefaultCurrentDocumentValue();
    }

    documentValue = normalizeCurrentDocumentValue(readJsonFile(documentValueFilePath), documentValue);
    if (documentValue.id && documentValue.createTime) {
        documentValue.count = countProcessImages(configData.processImageFolderPath, documentValue.createTime);
    }

    return documentValue;
}

function countProcessImages(processImageFolderPath: string, documentCreateTime: string): number {
    const imageFolderPath = path.join(processImageFolderPath, documentCreateTime);
    if (!pathExists(imageFolderPath)) {
        return 0;
    }
    return readDirectory(imageFolderPath).length;
}

import { exportTempFolderPath, finalJPGPath } from './constants';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportReplayParams, ExportSettings } from './models';
import path from 'path-browserify';
import { ensureDirectory, pathExists, readDirectory, removeDirectoryIfExists } from './storage';
import { createExportError } from './exportErrors';

interface ExportPreflightResult {
    imageFolderPath: string;
    imageFiles: string[];
}

export async function prepareExportReplayParams(
    configData: ConfigData,
    documentValue: CurrentDocumentValue,
    exportSettings: ExportSettings
): Promise<ExportReplayParams> {
    validateExportReplayPreflight(configData, documentValue, exportSettings);
    validateExportBinaries();

    const exportParams: ExportReplayParams = {
        configData: configData,
        documentValue: documentValue,
        exportSettings: exportSettings,
        exportTempFolderPath: exportTempFolderPath,
    };

    removeDirectoryIfExists(exportTempFolderPath);
    ensureDirectory(exportTempFolderPath);
    await generateFinalJPG(finalJPGPath);

    return exportParams;
}

export function validateExportReplayPreflight(
    configData: ConfigData,
    documentValue: CurrentDocumentValue,
    exportSettings: ExportSettings
): ExportPreflightResult {
    if (documentValue.id === null || documentValue.createTime === null) {
        throw createExportError("NO_ACTIVE_DOCUMENT", "No active document to export");
    }
    if (documentValue.bounds === null) {
        throw createExportError("DOCUMENT_BOUNDS_UNAVAILABLE", "Document bounds are unavailable");
    }
    if (documentValue.count === null || documentValue.count <= 0) {
        throw createExportError("NO_RECORDED_IMAGES", "No recorded images to export");
    }
    if (exportSettings.savePath === null || exportSettings.savePath.trim() === "") {
        throw createExportError("EXPORT_SAVE_PATH_EMPTY", "Export save path is empty");
    }
    if (configData.processImageFolderPath.trim() === "") {
        throw createExportError("PROCESS_IMAGE_FOLDER_EMPTY", "Process image folder path is empty");
    }

    const imageFolderPath = path.join(configData.processImageFolderPath, documentValue.createTime);
    if (!pathExists(imageFolderPath)) {
        throw createExportError("RECORDED_IMAGE_FOLDER_MISSING", "Recorded image folder does not exist");
    }

    const imageFiles = readDirectory(imageFolderPath)
        .filter(file => /\.(jpg|jpeg)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (imageFiles.length === 0) {
        throw createExportError("EXPORT_IMAGE_FILES_EMPTY", "No image files found");
    }

    return {
        imageFolderPath,
        imageFiles,
    };
}

export function runPreparedExportReplay(
    exportParams: ExportReplayParams,
    onProgress: (progress: ExportProgress) => void
): Promise<void> {
    return exportReplay(exportParams, onProgress);
}

function generateFinalJPG(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        cs.evalScript("$.f_record.generateFinalJPG('" + encodeURIComponent(filePath) + "')", function(result) {
            if (result === EvalScript_ErrMessage) {
                reject(new Error(result));
                return;
            }
            resolve();
        });
    });
}

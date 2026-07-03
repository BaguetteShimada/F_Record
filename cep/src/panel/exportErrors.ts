export type ExportErrorCode =
    | "NO_ACTIVE_DOCUMENT"
    | "DOCUMENT_BOUNDS_UNAVAILABLE"
    | "NO_RECORDED_IMAGES"
    | "EXPORT_SAVE_PATH_EMPTY"
    | "PROCESS_IMAGE_FOLDER_EMPTY"
    | "RECORDED_IMAGE_FOLDER_MISSING"
    | "EXPORT_IMAGE_FILES_EMPTY"
    | "EXPORT_VALID_IMAGE_FILES_EMPTY";

interface CodedError extends Error {
    code?: string;
    binaryName?: string;
}

export interface ExportFailureMessageDescriptor {
    key: string;
    values?: {
        binaryName: string;
    };
}

const exportErrorMessageKeys: Record<ExportErrorCode, string> = {
    NO_ACTIVE_DOCUMENT: "Export error no active document",
    DOCUMENT_BOUNDS_UNAVAILABLE: "Export error document bounds unavailable",
    NO_RECORDED_IMAGES: "Export error no recorded images",
    EXPORT_SAVE_PATH_EMPTY: "Export error save path empty",
    PROCESS_IMAGE_FOLDER_EMPTY: "Export error process folder empty",
    RECORDED_IMAGE_FOLDER_MISSING: "Export error recorded folder missing",
    EXPORT_IMAGE_FILES_EMPTY: "Export error image files empty",
    EXPORT_VALID_IMAGE_FILES_EMPTY: "Export error image files empty",
};

export function createExportError(code: ExportErrorCode, message: string): Error {
    const error = new Error(message) as CodedError;
    error.code = code;
    return error;
}

export function getExportErrorCode(error: unknown): string | null {
    if (typeof error !== "object" || error === null || Array.isArray(error)) {
        return null;
    }
    const maybeError = error as CodedError;
    return typeof maybeError.code === "string" ? maybeError.code : null;
}

export function getMissingExportBinaryName(error: unknown): string | null {
    if (typeof error !== "object" || error === null || Array.isArray(error)) {
        return null;
    }
    const maybeError = error as CodedError;
    if (maybeError.code === "MISSING_EXPORT_BINARY" && typeof maybeError.binaryName === "string") {
        return maybeError.binaryName;
    }
    return null;
}

export function getExportFailureMessageDescriptor(error: unknown): ExportFailureMessageDescriptor {
    const binaryName = getMissingExportBinaryName(error);
    if (binaryName !== null) {
        return {
            key: "Export binary missing",
            values: { binaryName },
        };
    }

    const code = getExportErrorCode(error);
    if (code !== null && Object.prototype.hasOwnProperty.call(exportErrorMessageKeys, code)) {
        return {
            key: exportErrorMessageKeys[code as ExportErrorCode],
        };
    }

    return {
        key: "Export failed",
    };
}

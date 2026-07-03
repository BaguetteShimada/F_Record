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

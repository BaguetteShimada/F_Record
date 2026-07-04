const DEFAULT_READ_JSON_RETRY_DELAYS = [20, 50];
const DEFAULT_WRITE_JSON_RETRY_DELAYS = [20, 50, 100, 200, 500];
const TRANSIENT_FILE_ERROR_CODES = ["EPERM", "EACCES", "EBUSY"];

export function pathExists(targetPath: string): boolean {
    return isExist(targetPath);
}

export function ensureDirectory(directoryPath: string): void {
    if (!pathExists(directoryPath)) {
        createDir(directoryPath);
    }
}

export function readDirectory(directoryPath: string): string[] {
    if (!pathExists(directoryPath)) {
        return [];
    }
    return readDir(directoryPath);
}

export function removeFileIfExists(filePath: string): void {
    if (pathExists(filePath)) {
        unlinkFile(filePath);
    }
}

export function removeDirectoryIfExists(directoryPath: string): void {
    if (pathExists(directoryPath)) {
        deleteDir(directoryPath);
    }
}

export function readJsonFile(filePath: string): unknown | null {
    if (!pathExists(filePath)) {
        return null;
    }

    for (let i = 0; i <= DEFAULT_READ_JSON_RETRY_DELAYS.length; i++) {
        try {
            return JSON.parse(readFile(filePath));
        } catch (error) {
            if (!shouldRetryJsonReadError(error) || i === DEFAULT_READ_JSON_RETRY_DELAYS.length) {
                return null;
            }
            sleepSync(DEFAULT_READ_JSON_RETRY_DELAYS[i]);
        }
    }

    return null;
}

export function writeJsonFile(filePath: string, value: unknown): void {
    writeTextFileWithRetry(filePath, JSON.stringify(value, null, 2));
}

export function writeTextFileWithRetry(filePath: string, content: string): void {
    let lastError: unknown = null;
    for (let i = 0; i <= DEFAULT_WRITE_JSON_RETRY_DELAYS.length; i++) {
        try {
            writeFile(filePath, content);
            return;
        } catch (error) {
            lastError = error;
            if (!shouldRetryJsonWriteError(error) || i === DEFAULT_WRITE_JSON_RETRY_DELAYS.length) {
                break;
            }
            sleepSync(DEFAULT_WRITE_JSON_RETRY_DELAYS[i]);
        }
    }
    throw lastError;
}

export function shouldRetryJsonReadError(error: unknown): boolean {
    if (error instanceof SyntaxError) {
        return true;
    }
    return hasTransientFileErrorCode(error);
}

export function shouldRetryJsonWriteError(error: unknown): boolean {
    return hasTransientFileErrorCode(error);
}

function hasTransientFileErrorCode(error: unknown): boolean {
    if (typeof error !== "object" || error === null || Array.isArray(error)) {
        return false;
    }
    const maybeFileError = error as { code?: unknown };
    return typeof maybeFileError.code === "string" && TRANSIENT_FILE_ERROR_CODES.includes(maybeFileError.code);
}

function sleepSync(ms: number): void {
    const end = Date.now() + ms;
    while (Date.now() < end) {}
}

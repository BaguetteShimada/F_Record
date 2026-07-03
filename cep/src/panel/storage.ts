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

    const retryDelays = [20, 50];
    for (let i = 0; i <= retryDelays.length; i++) {
        try {
            return JSON.parse(readFile(filePath));
        } catch (error) {
            if (!shouldRetryJsonReadError(error) || i === retryDelays.length) {
                return null;
            }
            sleepSync(retryDelays[i]);
        }
    }

    return null;
}

export function writeJsonFile(filePath: string, value: unknown): void {
    writeFile(filePath, JSON.stringify(value, null, 2));
}

export function shouldRetryJsonReadError(error: unknown): boolean {
    if (error instanceof SyntaxError) {
        return true;
    }
    if (typeof error !== "object" || error === null || Array.isArray(error)) {
        return false;
    }
    const maybeFileError = error as { code?: unknown };
    return maybeFileError.code === "EPERM" || maybeFileError.code === "EACCES" || maybeFileError.code === "EBUSY";
}

function sleepSync(ms: number): void {
    const end = Date.now() + ms;
    while (Date.now() < end) {}
}

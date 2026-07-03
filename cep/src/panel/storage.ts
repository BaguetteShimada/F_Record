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
    try {
        return JSON.parse(readFile(filePath));
    } catch (error) {
        return null;
    }
}

export function writeJsonFile(filePath: string, value: unknown): void {
    writeFile(filePath, JSON.stringify(value, null, 2));
}

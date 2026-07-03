import path from 'path-browserify';

export function getProcessImageFolderPath(processImageFolderPath: string, createTime: string | null | undefined): string {
    return path.join(processImageFolderPath, createTime || "");
}

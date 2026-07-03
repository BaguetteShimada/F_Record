import type { ConfigData, CurrentDocumentValue } from './models';
import { getProcessImageFolderPath } from './documentPaths';

type LocalPathOpener = (targetPath: string) => void;

export function openCurrentDocumentProcessImageFolder(
    configData: Pick<ConfigData, 'processImageFolderPath'>,
    documentValue: Pick<CurrentDocumentValue, 'createTime'>,
    onError: (error: unknown) => void,
    opener: LocalPathOpener = openLocalPath
): void {
    try {
        opener(getProcessImageFolderPath(configData.processImageFolderPath, documentValue.createTime));
    } catch (error) {
        onError(error);
    }
}

import type { CurrentDocumentValue } from './models';

export function isExportReplayDisabled(documentValue: Pick<CurrentDocumentValue, 'id' | 'count'>): boolean {
    return !documentValue.id || !documentValue.count;
}

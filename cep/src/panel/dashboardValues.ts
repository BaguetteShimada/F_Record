import type { CurrentDocumentValue } from './models';
import { formatElapsedTime, type TimeUnitLabels } from './timeFormatting';

function hasDocument(documentValue: CurrentDocumentValue): boolean {
    return Boolean(documentValue.id);
}

export function getDocumentNameDisplayValue(documentValue: CurrentDocumentValue): string {
    return hasDocument(documentValue) ? documentValue.name || "" : "";
}

export function getImageCountDisplayValue(documentValue: CurrentDocumentValue): string {
    return hasDocument(documentValue) ? String(documentValue.count ?? "") : "";
}

export function getTimeSpentDisplayValue(documentValue: CurrentDocumentValue, labels: TimeUnitLabels): string {
    return hasDocument(documentValue) ? formatElapsedTime(documentValue.timeSpent, labels) : "";
}

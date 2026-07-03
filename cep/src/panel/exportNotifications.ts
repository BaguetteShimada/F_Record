import { getExportFailureMessageDescriptor } from './exportErrors';

type TranslationValues = Record<string, string>;
type ExportTranslator = (key: string, values?: TranslationValues) => string;

interface ToastActionOptions {
    actionLabel: string;
    onAction: () => void;
}

interface ToastInfoOptions {
    timeout: number;
}

export interface ExportToastQueue {
    info(message: string, options: ToastInfoOptions): void;
    positive(message: string, options: ToastActionOptions): void;
    negative(message: string, options: ToastActionOptions): void;
}

export function showExportStartedToast(t: ExportTranslator, toastQueue: ExportToastQueue): void {
    toastQueue.info(t('Start to export'), { timeout: 5000 });
}

export function showExportSuccessToast(
    t: ExportTranslator,
    toastQueue: ExportToastQueue,
    onOpen: () => void
): void {
    toastQueue.positive(t('Export success'), {
        actionLabel: t('Open'),
        onAction: onOpen,
    });
}

export function showExportFailureToast(
    error: unknown,
    t: ExportTranslator,
    toastQueue: ExportToastQueue,
    onDetails: () => void
): void {
    const message = getExportFailureMessageDescriptor(error);
    toastQueue.negative(t(message.key, message.values), {
        actionLabel: t('Details'),
        onAction: onDetails,
    });
}

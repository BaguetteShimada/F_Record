import type { ConfigData } from './models';

interface LanguageChanger {
    changeLanguage(language: string): unknown;
}

export function applyLanguageChange(
    language: string,
    languageChanger: LanguageChanger,
    onConfigChange: (configChange: Pick<ConfigData, 'language'>) => void
): void {
    languageChanger.changeLanguage(language);
    onConfigChange({
        language,
    });
}

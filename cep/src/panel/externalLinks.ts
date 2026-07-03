export const GITHUB_REPOSITORY_URL = 'https://github.com/BaguetteShimada/F_Record';

interface ExternalUrlOpener {
    openURLInDefaultBrowser(url: string): void;
}

export function openExternalUrl(
    url: string,
    onError: (error: unknown) => void,
    opener: ExternalUrlOpener = window.cep.util
): void {
    try {
        opener.openURLInDefaultBrowser(url);
    } catch (error) {
        onError(error);
    }
}

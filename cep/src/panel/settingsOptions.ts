export const RESOLUTION_OPTIONS = ['360', '720', '1080', '1440'] as const;

export const QUALITY_OPTIONS = [
    { key: '20', labelKey: 'low' },
    { key: '70', labelKey: 'medium' },
    { key: '90', labelKey: 'high' },
] as const;

export const IDLE_TIMEOUT_MINUTE_OPTIONS = [1, 5, 10, 30] as const;

export const LANGUAGE_OPTIONS = [
    { key: 'cn', label: '中文' },
    { key: 'en', label: 'English' },
] as const;

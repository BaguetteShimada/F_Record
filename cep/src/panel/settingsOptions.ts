import {
    VALID_IDLE_TIMEOUTS,
    VALID_LANGUAGES,
    VALID_QUALITIES,
    VALID_RESOLUTIONS,
} from './models';

export const RESOLUTION_OPTIONS = VALID_RESOLUTIONS;

export const QUALITY_OPTIONS = [
    { key: VALID_QUALITIES[0], labelKey: 'low' },
    { key: VALID_QUALITIES[1], labelKey: 'medium' },
    { key: VALID_QUALITIES[2], labelKey: 'high' },
] as const;

export const IDLE_TIMEOUT_MINUTE_OPTIONS = VALID_IDLE_TIMEOUTS
    .filter(value => value !== '0')
    .map(value => Number(value));

export const LANGUAGE_OPTIONS = [
    { key: VALID_LANGUAGES[0], label: '中文' },
    { key: VALID_LANGUAGES[1], label: 'English' },
] as const;

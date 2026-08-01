import path from 'path-browserify';
import { F_Record_Dir } from './constants';

export interface DocumentBounds {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

export interface ConfigData {
    isEnabled: boolean;
    processImageFolderPath: string;
    resolution: string;
    quality: string;
    idleTimeout: string;
    language: string;
    lastExportTime: number | null;
}

export interface NowDocument {
    id: number | null;
    createTime: string | null;
    name: string | null;
    isGettingImage: boolean | null;
    bounds: DocumentBounds | null;
}

export interface DocumentValue {
    count: number | null;
    timeSpent: number | null;
    lastModifiedTime: number | null;
}

export type CurrentDocumentValue = NowDocument & DocumentValue;

export interface ExportSettings {
    isExporting: boolean;
    aspectRatio: string;
    duration: string;
    savePath: string | null;
}

export interface ExportProgress {
    status: string;
    percent: number;
}

export interface ExportReplayParams {
    configData: ConfigData;
    documentValue: CurrentDocumentValue;
    exportSettings: ExportSettings;
    exportTempFolderPath: string;
}

export const VALID_RESOLUTIONS = ["360", "720", "1080", "1440"] as const;
export const VALID_QUALITIES = ["20", "70", "90"] as const;
export const VALID_IDLE_TIMEOUTS = ["0", "1", "5", "10", "30"] as const;
export const VALID_LANGUAGES = ["cn", "en"] as const;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
    return typeof value === "string" ? value : fallback;
}

function readStringOption<T extends readonly string[]>(value: unknown, fallback: string, validValues: T): T[number] | string {
    if (typeof value !== "string") {
        return fallback;
    }
    return (validValues as readonly string[]).includes(value) ? value : fallback;
}

function readNullableString(value: unknown, fallback: string | null): string | null {
    if (value === null) {
        return null;
    }
    return typeof value === "string" ? value : fallback;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function readNullableBoolean(value: unknown, fallback: boolean | null): boolean | null {
    if (value === null) {
        return null;
    }
    return typeof value === "boolean" ? value : fallback;
}

function readNullableNumber(value: unknown, fallback: number | null): number | null {
    if (value === null) {
        return null;
    }
    return isFiniteNumber(value) ? value : fallback;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && isFinite(value);
}

function readBounds(value: unknown, fallback: DocumentBounds | null): DocumentBounds | null {
    if (value === null) {
        return null;
    }
    if (!isRecord(value)) {
        return fallback;
    }
    const { top, left, bottom, right } = value;
    if (
        typeof top !== "number" ||
        typeof left !== "number" ||
        typeof bottom !== "number" ||
        typeof right !== "number" ||
        !isFiniteNumber(top) ||
        !isFiniteNumber(left) ||
        !isFiniteNumber(bottom) ||
        !isFiniteNumber(right)
    ) {
        return fallback;
    }
    return { top, left, bottom, right };
}

export function createDefaultConfigData(): ConfigData {
    return {
        isEnabled: false,
        processImageFolderPath: path.join(F_Record_Dir, "processImages"),
        resolution: "1080",
        quality: "70",
        idleTimeout: "1",
        language: "cn",
        lastExportTime: null,
    };
}

export function createDefaultCurrentDocumentValue(): CurrentDocumentValue {
    return {
        id: null,
        createTime: null,
        name: null,
        isGettingImage: null,
        bounds: null,
        count: null,
        timeSpent: null,
        lastModifiedTime: null,
    };
}

export function createDefaultExportSettings(): ExportSettings {
    return {
        isExporting: false,
        aspectRatio: "0",
        duration: "0",
        savePath: null,
    };
}

export function createDefaultExportProgress(): ExportProgress {
    return {
        status: "",
        percent: 0,
    };
}

export function normalizeConfigData(value: unknown, fallback: ConfigData = createDefaultConfigData()): ConfigData {
    if (!isRecord(value)) {
        return { ...fallback };
    }
    return {
        isEnabled: readBoolean(value.isEnabled, fallback.isEnabled),
        processImageFolderPath: readString(value.processImageFolderPath, fallback.processImageFolderPath),
        resolution: normalizeResolution(value.resolution, fallback.resolution),
        quality: normalizeQuality(value.quality, fallback.quality),
        idleTimeout: normalizeIdleTimeout(value.idleTimeout, fallback.idleTimeout),
        language: normalizeLanguage(value.language, fallback.language),
        lastExportTime: readNullableNumber(value.lastExportTime, fallback.lastExportTime),
    };
}

export function normalizeResolution(value: unknown, fallback = createDefaultConfigData().resolution): string {
    return readStringOption(value, fallback, VALID_RESOLUTIONS);
}

export function normalizeQuality(value: unknown, fallback = createDefaultConfigData().quality): string {
    return readStringOption(value, fallback, VALID_QUALITIES);
}

export function normalizeIdleTimeout(value: unknown, fallback = createDefaultConfigData().idleTimeout): string {
    return readStringOption(value, fallback, VALID_IDLE_TIMEOUTS);
}

export function normalizeLanguage(value: unknown, fallback = createDefaultConfigData().language): string {
    return readStringOption(value, fallback, VALID_LANGUAGES);
}

export function normalizeCurrentDocumentValue(
    value: unknown,
    fallback: CurrentDocumentValue = createDefaultCurrentDocumentValue()
): CurrentDocumentValue {
    if (!isRecord(value)) {
        return { ...fallback };
    }
    return {
        id: readNullableNumber(value.id, fallback.id),
        createTime: readNullableString(value.createTime, fallback.createTime),
        name: readNullableString(value.name, fallback.name),
        isGettingImage: readNullableBoolean(value.isGettingImage, fallback.isGettingImage),
        bounds: readBounds(value.bounds, fallback.bounds),
        count: readNullableNumber(value.count, fallback.count),
        timeSpent: readNullableNumber(value.timeSpent, fallback.timeSpent),
        lastModifiedTime: readNullableNumber(value.lastModifiedTime, fallback.lastModifiedTime),
    };
}

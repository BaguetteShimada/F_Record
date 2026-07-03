import * as React from 'react';
import { darkTheme, lightTheme } from '@adobe/react-spectrum';
import type { ConfigData, CurrentDocumentValue, ExportSettings } from './models';
import { loadConfigData, saveConfigData } from './configStore';
import { clearNowDocument, loadCurrentDocumentValue } from './documentStore';
import { startPanelPolling } from './polling';

const themeChangedEventName = 'com.adobe.csxs.events.ThemeColorChanged';

type ErrorHandler = (error: unknown) => void;

function useLatest<T>(value: T): React.MutableRefObject<T> {
    const ref = React.useRef(value);
    React.useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
}

export function usePersistentPanel(onError: ErrorHandler): void {
    const onErrorRef = useLatest(onError);

    React.useEffect(() => {
        try {
            persistentPanel();
        } catch (error) {
            onErrorRef.current(error);
        }
    }, [onErrorRef]);
}

export function useConfigSync(
    configData: React.MutableRefObject<ConfigData>,
    onConfigLoaded: (configData: ConfigData) => void,
    onError: ErrorHandler
): void {
    const onConfigLoadedRef = useLatest(onConfigLoaded);
    const onErrorRef = useLatest(onError);

    React.useEffect(() => {
        try {
            configData.current = loadConfigData(configData.current);
            onConfigLoadedRef.current(configData.current);
        } catch (error) {
            onErrorRef.current(error);
        }

        const saveCurrentConfig = () => {
            try {
                saveConfigData(configData.current);
            } catch (error) {
                // Keep the panel responsive if a transient filesystem write fails.
            }
        };

        return startPanelPolling(saveCurrentConfig);
    }, [configData, onConfigLoadedRef, onErrorRef]);
}

export function useCurrentDocumentSync(
    configData: React.MutableRefObject<ConfigData>,
    setDocumentValue: React.Dispatch<React.SetStateAction<CurrentDocumentValue>>
): void {
    React.useEffect(() => {
        try {
            clearNowDocument();
        } catch (error) {
            // Existing behavior tolerates missing or locked nowDocument state.
        }

        const updateCurrentDocument = () => {
            try {
                setDocumentValue(loadCurrentDocumentValue(configData.current));
            } catch (error) {
                // Keep polling even if a concurrent write makes one read fail.
            }
        };

        return startPanelPolling(updateCurrentDocument);
    }, [configData, setDocumentValue]);
}

export function useExportTimeSync(
    configData: React.MutableRefObject<ConfigData>,
    exportSettings: React.MutableRefObject<ExportSettings>
): void {
    React.useEffect(() => {
        const updateLastExportTime = () => {
            if (exportSettings.current.isExporting) {
                configData.current.lastExportTime = new Date().getTime();
            }
        };

        return startPanelPolling(updateLastExportTime);
    }, [configData, exportSettings]);
}

export function useHostThemeSync(
    setTheme: React.Dispatch<React.SetStateAction<typeof darkTheme>>,
    onError: ErrorHandler
): void {
    const onErrorRef = useLatest(onError);

    React.useEffect(() => {
        const syncTheme = () => {
            const hostEnv = cs.getHostEnvironment();
            const bgColor = hostEnv.appSkinInfo.appBarBackgroundColor;
            if (bgColor.color.red < 127) {
                setTheme(darkTheme);
            } else {
                setTheme(lightTheme);
            }
        };

        try {
            syncTheme();
            cs.addEventListener(themeChangedEventName, syncTheme);
        } catch (error) {
            onErrorRef.current(error);
        }

        return () => {
            try {
                cs.removeEventListener(themeChangedEventName, syncTheme);
            } catch (error) {
                // Ignore cleanup failures from older CSInterface implementations.
            }
        };
    }, [onErrorRef, setTheme]);
}

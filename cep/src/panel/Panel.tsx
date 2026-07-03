import * as React from 'react';
import { Item, Provider, TabList, TabPanels, Tabs, Text, darkTheme, ToastContainer, ToastQueue } from '@adobe/react-spectrum';
import Settings from '@spectrum-icons/workflow/Settings';
import MovieCamera from '@spectrum-icons/workflow/MovieCamera';
import DashboardPanel from './DashboardPanel';
import SettingsPanel from './SettingsPanel';
import { useTranslation } from 'react-i18next';
import {
    createDefaultConfigData,
    createDefaultCurrentDocumentValue,
    createDefaultExportProgress,
    createDefaultExportSettings,
} from './models';
import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import {
    useConfigSync,
    useCurrentDocumentSync,
    useExportTimeSync,
    useHostThemeSync,
    usePersistentPanel,
} from './panelHooks';


function Panel() {
    const [, forceUpdate] = React.useState({});

    const { t , i18n } = useTranslation();

    const [theme, setTheme] = React.useState(darkTheme);

    const configData = React.useRef<ConfigData>(createDefaultConfigData());

    const [documentValue, setDocumentValue] = React.useState<CurrentDocumentValue>(() => createDefaultCurrentDocumentValue());

    const exportSettings = React.useRef<ExportSettings>(createDefaultExportSettings());

    const [progress, setProgress] = React.useState<ExportProgress>(() => createDefaultExportProgress());

    const showPanelError = React.useCallback((error: unknown) => {
        ToastQueue.negative(t('Error'), {
            actionLabel: t('Details'),
            onAction: () => showError(error)
        });
    }, [t]);

    const handleConfigLoaded = React.useCallback((loadedConfigData: ConfigData) => {
        i18n.changeLanguage(loadedConfigData.language);
        forceUpdate({});
    }, [i18n]);

    const handleConfigChange = React.useCallback((configChange: Partial<ConfigData>) => {
        configData.current = {
            ...configData.current,
            ...configChange,
        };
        forceUpdate({});
    }, []);

    const handleExportSettingsChange = React.useCallback((exportSettingsChange: Partial<ExportSettings>) => {
        exportSettings.current = {
            ...exportSettings.current,
            ...exportSettingsChange,
        };
        forceUpdate({});
    }, []);

    usePersistentPanel(showPanelError);
    useConfigSync(configData, handleConfigLoaded, showPanelError);
    useCurrentDocumentSync(configData, setDocumentValue);
    useExportTimeSync(configData, exportSettings);
    useHostThemeSync(setTheme, showPanelError);

    return (
        <Provider theme={theme}>
            <ToastContainer placement="bottom" />
            <div className="fr-panel-shell">
                <Tabs aria-label="Tab of Panel" width="100%" UNSAFE_className="fr-tabs">
                    <TabList>
                        <Item key="Dashboard Panel" textValue={t('Dashboard')}>
                            <MovieCamera />
                            <Text UNSAFE_className="fr-tab-label">{t('Dashboard')}</Text>
                        </Item>
                        <Item key="Settings Panel" textValue={t('Settings')}>
                            <Settings />
                            <Text UNSAFE_className="fr-tab-label">{t('Settings')}</Text>
                        </Item>
                    </TabList>
                    <TabPanels>
                        <Item key="Dashboard Panel">
                            <DashboardPanel configData={configData} documentValue={documentValue} exportSettings={exportSettings} progress={progress} setProgress={setProgress} onConfigChange={handleConfigChange} onExportSettingsChange={handleExportSettingsChange} onError={showPanelError}/>
                        </Item>
                        <Item key="Settings Panel">
                            <SettingsPanel configData={configData} onConfigChange={handleConfigChange}/>
                        </Item>
                    </TabPanels>
                </Tabs>
            </div>
        </Provider>
    );
};

export default Panel;

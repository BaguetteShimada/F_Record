import type { ConfigData, CurrentDocumentValue, ExportProgress, ExportSettings } from './models';
import { prepareExportReplayParams, runPreparedExportReplay } from './exportReplayService';

interface ExportReplayFlowDependencies {
    prepareExportReplayParams?: typeof prepareExportReplayParams;
    runPreparedExportReplay?: typeof runPreparedExportReplay;
}

export async function runExportReplayFlow(
    configData: ConfigData,
    documentValue: CurrentDocumentValue,
    exportSettings: ExportSettings,
    onProgress: (progress: ExportProgress) => void,
    dependencies: ExportReplayFlowDependencies = {}
): Promise<void> {
    const prepare = dependencies.prepareExportReplayParams ?? prepareExportReplayParams;
    const run = dependencies.runPreparedExportReplay ?? runPreparedExportReplay;
    const exportParams = await prepare(configData, documentValue, exportSettings);
    await run(exportParams, onProgress);
}

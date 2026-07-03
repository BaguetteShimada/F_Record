import * as React from 'react';
import { ProgressBar } from '@adobe/react-spectrum';
import type { ExportProgress } from './models';

interface ExportProgressBarProps {
    progress: ExportProgress;
    label: string;
}

function ExportProgressBar({ progress, label }: ExportProgressBarProps) {
    return (
        <ProgressBar
            value={progress.percent}
            label={label}
            width="100%"
            UNSAFE_className="fr-export-progress"
        />
    );
}

export default ExportProgressBar;

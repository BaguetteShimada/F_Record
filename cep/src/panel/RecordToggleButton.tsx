import * as React from 'react';
import { getRecordToggleLabel } from './recordToggle';

interface RecordToggleButtonProps {
    isEnabled: boolean;
    enabledLabel: string;
    disabledLabel: string;
    onToggle: () => void;
}

function RecordToggleButton({
    isEnabled,
    enabledLabel,
    disabledLabel,
    onToggle,
}: RecordToggleButtonProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            aria-label="Toggle Enabled"
            className="fr-record-switch"
            onClick={onToggle}
        >
            <span className="fr-record-switch-track" aria-hidden="true">
                <span className="fr-record-switch-thumb" />
            </span>
            <span className="fr-record-switch-label">
                {getRecordToggleLabel(isEnabled, {
                    enabled: enabledLabel,
                    disabled: disabledLabel,
                })}
            </span>
        </button>
    );
}

export default RecordToggleButton;

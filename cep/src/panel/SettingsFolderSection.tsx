import * as React from 'react';
import { ActionButton, Text, TextField, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import FolderOpen from '@spectrum-icons/workflow/FolderOpen';

interface SettingsFolderSectionProps {
    label: string;
    value: string;
    buttonLabel: string;
    tooltipLabel: string;
    onSelectFolder: () => void;
}

function SettingsFolderSection({
    label,
    value,
    buttonLabel,
    tooltipLabel,
    onSelectFolder,
}: SettingsFolderSectionProps) {
    return (
        <div className="fr-settings-section">
            <Text marginBottom="size-100">{label}</Text>
            <div className="fr-settings-folder-row">
                <TextField
                    aria-label="Process Image Folder"
                    value={value}
                    isReadOnly
                    width="100%"
                />
                <TooltipTrigger delay={0}>
                    <ActionButton
                        aria-label={buttonLabel}
                        onPress={onSelectFolder}
                    >
                        <FolderOpen />
                    </ActionButton>
                    <Tooltip>{tooltipLabel}</Tooltip>
                </TooltipTrigger>
            </div>
        </div>
    );
}

export default SettingsFolderSection;

import * as React from 'react';
import { ActionButton, Text, TextField, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import DocumentOutline from '@spectrum-icons/workflow/DocumentOutline';
import FolderOpen from '@spectrum-icons/workflow/FolderOpen';

interface DashboardDocumentRowProps {
    label: string;
    value: string;
    showOpenButton: boolean;
    isOpenButtonDisabled: boolean;
    openButtonLabel: string;
    onOpenFolder: () => void;
}

function DashboardDocumentRow({
    label,
    value,
    showOpenButton,
    isOpenButtonDisabled,
    openButtonLabel,
    onOpenFolder,
}: DashboardDocumentRowProps) {
    return (
        <div className="fr-data-row">
            <div className="fr-row-label">
                <DocumentOutline size="S" />
                <Text>{label}</Text>
            </div>
            <div className="fr-document-value">
                <TextField
                    width="100%"
                    value={value}
                    isReadOnly
                />
                {showOpenButton && (
                    <TooltipTrigger delay={0}>
                        <ActionButton
                            aria-label="Open Current Document Process Image Folder"
                            onPress={onOpenFolder}
                            isDisabled={isOpenButtonDisabled}
                            UNSAFE_className="fr-document-folder-button"
                        >
                            <FolderOpen />
                        </ActionButton>
                        <Tooltip>{openButtonLabel}</Tooltip>
                    </TooltipTrigger>
                )}
            </div>
        </div>
    );
}

export default DashboardDocumentRow;

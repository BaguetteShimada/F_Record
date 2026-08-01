import * as React from 'react';
import { Content, ContextualHelp, Picker, Text } from '@adobe/react-spectrum';

interface SettingsPickerRowProps {
    label: string;
    ariaLabel: string;
    selectedKey: string;
    onSelectionChange: (key: React.Key) => void;
    children: React.ReactElement | React.ReactElement[];
    helpText?: string;
}

function SettingsPickerRow({
    label,
    ariaLabel,
    selectedKey,
    onSelectionChange,
    children,
    helpText,
}: SettingsPickerRowProps) {
    return (
        <div className="fr-field-row fr-settings-row">
            <div className="fr-field-label fr-settings-label">
                {helpText ? (
                    <>
                        <Text marginEnd="size-100">{label}</Text>
                        <ContextualHelp variant="help" placement="top start">
                            <Content>
                                <Text>{helpText}</Text>
                            </Content>
                        </ContextualHelp>
                    </>
                ) : (
                    <Text>{label}</Text>
                )}
            </div>
            <Picker
                aria-label={ariaLabel}
                selectedKey={selectedKey}
                onSelectionChange={onSelectionChange}
                width="size-1200"
                UNSAFE_className="fr-control-picker fr-settings-picker"
            >
                {children}
            </Picker>
        </div>
    );
}

export default SettingsPickerRow;

import * as React from 'react';
import { Text, TextField } from '@adobe/react-spectrum';

interface DashboardTextRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function DashboardTextRow({ icon, label, value }: DashboardTextRowProps) {
    return (
        <div className="fr-field-row fr-data-row">
            <div className="fr-field-label fr-row-label">
                {icon}
                <Text>{label}</Text>
            </div>
            <div className="fr-field-control fr-row-value">
                <TextField
                    width="100%"
                    value={value}
                    isReadOnly
                    UNSAFE_className="fr-control-field"
                />
            </div>
        </div>
    );
}

export default DashboardTextRow;

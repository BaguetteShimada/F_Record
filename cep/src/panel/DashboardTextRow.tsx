import * as React from 'react';
import { Text, TextField } from '@adobe/react-spectrum';

interface DashboardTextRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function DashboardTextRow({ icon, label, value }: DashboardTextRowProps) {
    return (
        <div className="fr-data-row">
            <div className="fr-row-label">
                {icon}
                <Text>{label}</Text>
            </div>
            <div className="fr-row-value">
                <TextField
                    width="100%"
                    value={value}
                    isReadOnly
                />
            </div>
        </div>
    );
}

export default DashboardTextRow;

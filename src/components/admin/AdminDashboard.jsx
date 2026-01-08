import React, { useState } from 'react';
import CsvImporter from './CsvImporter';
import AttendeeList from './AttendeeList';
import QrPreviewModal from './QrPreviewModal';
import { ApiUtils } from '../../services/api';

const AdminDashboard = ({
    attendees,
    onSync,
    config,
    setAttendees, // local update optimization
    isSyncing
}) => {
    const [selectedAttendee, setSelectedAttendee] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async (rows) => {
        setIsImporting(true);
        try {
            // Optimistic or wait? GAS is synchronous-ish.
            const res = await ApiUtils.upsertAttendees(rows, config);
            if (res.ok) {
                onSync(); // Refresh full list
                alert(`Imported! Inserted: ${res.inserted}, Updated: ${res.updated}`);
            } else {
                alert("Import failed: " + res.error);
            }
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="container animate-spawn" style={{ paddingTop: '80px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Administration</h2>

            <CsvImporter onImport={handleImport} isImporting={isImporting} />

            <AttendeeList
                attendees={attendees}
                onSelectQr={(a) => setSelectedAttendee(a)}
            />

            <QrPreviewModal
                isOpen={!!selectedAttendee}
                onClose={() => setSelectedAttendee(null)}
                attendee={selectedAttendee}
                eventCode={config.eventCode}
            />
        </div>
    );
};

export default AdminDashboard;

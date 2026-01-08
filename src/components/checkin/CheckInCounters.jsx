import React from 'react';

const CheckInCounters = ({ attendees }) => {
    const stats = {
        total: attendees.length,
        checkedIn: attendees.filter(a => a.status === 'checked_in').length,
        notYet: attendees.filter(a => !a.status || a.status === 'not_yet').length,
        inactive: attendees.filter(a => a.status === 'inactive').length,
    };

    return (
        <div className="glass-panel" style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{stats.checkedIn}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Checked In</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stats.notYet}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Pending</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{stats.total}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total</div>
            </div>
        </div>
    );
};

export default CheckInCounters;

import React, { useState, useMemo } from 'react';

const AttendeeList = ({ attendees, onSelectQr }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, checked_in, not_yet, inactive

    const filtered = useMemo(() => {
        return attendees
            .filter(a => {
                if (filter === 'all') return true;
                if (filter === 'checked_in') return a.status === 'checked_in';
                if (filter === 'not_yet') return !a.status || a.status === 'not_yet';
                if (filter === 'inactive') return a.status === 'inactive';
                return true;
            })
            .filter(a => {
                const q = search.toLowerCase();
                return (a.name || '').toLowerCase().includes(q) ||
                    (a.email || '').toLowerCase().includes(q) ||
                    (a.id || '').toLowerCase().includes(q);
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [attendees, search, filter]);

    const getStatusColor = (status) => {
        if (status === 'checked_in') return 'var(--color-success)'; // Green
        if (status === 'inactive') return 'var(--color-danger)'; // Red
        return 'var(--color-text-muted)'; // Gray
    };

    return (
        <div className="glass-panel" style={{ padding: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                    placeholder="Search name, email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                />
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{ flex: '0 0 120px' }}
                >
                    <option value="all">All</option>
                    <option value="not_yet">Not Yet</option>
                    <option value="checked_in">Checked In</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-glass-border)', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>Name</th>
                            <th style={{ padding: '8px' }}>Status</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
                                <td style={{ padding: '8px' }}>
                                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{a.email}</div>
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <span style={{
                                        display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                                        fontSize: '0.7rem', border: `1px solid ${getStatusColor(a.status)}`, color: getStatusColor(a.status)
                                    }}>
                                        {a.status || 'not_yet'}
                                    </span>
                                    {a.checked_in_at && <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>{new Date(a.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                                </td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>
                                    <button
                                        className="btn"
                                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                        onClick={() => onSelectQr(a)}
                                    >
                                        QR
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No attendees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                Total: {filtered.length} / {attendees.length}
            </div>
        </div>
    );
};

export default AttendeeList;

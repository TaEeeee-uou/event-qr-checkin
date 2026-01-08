import React from 'react';

const ActionLog = ({ logs }) => {
    return (
        <div className="glass-panel" style={{ padding: '16px', marginTop: '16px', flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Activity Log</h3>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                {logs.map((log, i) => (
                    <div key={i} style={{
                        padding: '8px',
                        marginBottom: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${log.result?.includes('check') ? 'var(--color-success)' : (log.result === 'undo' ? 'var(--color-warning)' : 'var(--color-danger)')}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{log.name || log.id || 'Unknown'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.message || log.result}</div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            {new Date(log.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                        No activity yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionLog;

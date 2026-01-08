import React from 'react';

const StatusBanner = ({ lastSyncedAt, isSyncing, onSync, error }) => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                marginTop: 'var(--header-height)',
                background: error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.2)',
                borderBottom: '1px solid var(--color-glass-border)',
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: error ? 'var(--color-danger)' : (isSyncing ? 'var(--color-warning)' : 'var(--color-success)')
                }}></span>
                <span>
                    {isSyncing ? 'Syncing...' : (
                        error ? `Error: ${error}` : (
                            lastSyncedAt ? `Synced: ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Not synced'
                        )
                    )}
                </span>
            </div>

            <button
                onClick={onSync}
                disabled={isSyncing}
                style={{
                    background: 'transparent',
                    border: '1px solid var(--color-glass-border)',
                    color: 'var(--color-text-primary)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                }}
            >
                🔄 Sync
            </button>
        </div>
    );
};

export default StatusBanner;

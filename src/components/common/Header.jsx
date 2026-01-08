import React from 'react';

const Header = ({ currentMode, setMode, onOpenSettings }) => {
    return (
        <header
            className="glass-panel"
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                height: 'var(--header-height)',
                zIndex: 100,
                borderRadius: 0,
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    EventQR
                </h1>
            </div>

            <nav style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '4px' }}>
                <button
                    onClick={() => setMode('admin')}
                    style={{
                        background: currentMode === 'admin' ? 'var(--color-glass-highlight)' : 'transparent',
                        color: currentMode === 'admin' ? 'white' : 'var(--color-text-secondary)',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    Admin
                </button>
                <button
                    onClick={() => setMode('checkin')}
                    style={{
                        background: currentMode === 'checkin' ? 'var(--color-success)' : 'transparent', // distinct color for checkin
                        color: currentMode === 'checkin' ? 'white' : 'var(--color-text-secondary)',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    Check-in
                </button>
            </nav>

            <button onClick={onOpenSettings} className="btn" style={{ padding: '6px', borderRadius: '50%' }}>
                ⚙️
            </button>
        </header>
    );
};

export default Header;

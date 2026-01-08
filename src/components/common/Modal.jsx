import React from 'react';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-spawn"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            onClick={onClose}
        >
            <div
                className="glass-panel w-full max-w-lg p-6 relative"
                style={{ maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{ padding: '4px 8px', fontSize: '1.2rem', background: 'transparent', border: 'none' }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    {children}
                </div>

                {actions && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;

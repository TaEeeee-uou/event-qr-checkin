import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const Scanner = ({ onScan, isScanning, onStop }) => {
    const scannerRef = useRef(null);
    const [error, setError] = useState(null);

    const onScanRef = useRef(onScan);
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        let html5QrCode;

        const startScanner = async () => {
            try {
                // Ensure previous instance is gone
                if (scannerRef.current) {
                    await scannerRef.current.stop().catch(() => { });
                    scannerRef.current.clear().catch(() => { });
                    scannerRef.current = null;
                }

                html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        // Pause removed to prevent getting stuck (requires resume logic)
                        // The overlay provides enough feedback and the parent 'processing' flag prevents double-reads.

                        // Vibration feedback
                        if (navigator.vibrate) navigator.vibrate(200);

                        if (onScanRef.current) {
                            onScanRef.current(decodedText);
                        }
                    },
                    (errorMessage) => {
                        // ignore scan errors
                    }
                );
            } catch (err) {
                console.error("Camera error", err);
                setError("カメラを起動できませんでした。権限を確認してください。");
            }
        };

        if (isScanning) {
            // slightly longer delay to ensure DOM readiness
            setTimeout(() => startScanner(), 300);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(err => {
                    console.warn('Stop failed', err);
                    try { scannerRef.current.clear(); } catch (e) { }
                });
                scannerRef.current = null;
            }
        };
    }, [isScanning]);

    if (!isScanning) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#000', display: 'flex', flexDirection: 'column' }}>
            {/* Full screen video container */}
            <div id="reader" style={{ width: '100%', height: '100%', flex: 1, overflow: 'hidden' }}></div>

            {/* Custom CSS to force video cover */}
            <style>{`
            #reader video {
                object-fit: cover !important;
                width: 100% !important;
                height: 100% !important;
            }
            `}</style>

            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {/* Guide Frame */}
                <div style={{
                    width: '260px', height: '260px',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '24px',
                    boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)',
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '40px', height: '40px', borderTop: '4px solid var(--color-primary)', borderLeft: '4px solid var(--color-primary)', borderTopLeftRadius: '24px' }}></div>
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '40px', height: '40px', borderTop: '4px solid var(--color-primary)', borderRight: '4px solid var(--color-primary)', borderTopRightRadius: '24px' }}></div>
                    <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '40px', height: '40px', borderBottom: '4px solid var(--color-primary)', borderLeft: '4px solid var(--color-primary)', borderBottomLeftRadius: '24px' }}></div>
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '40px', height: '40px', borderBottom: '4px solid var(--color-primary)', borderRight: '4px solid var(--color-primary)', borderBottomRightRadius: '24px' }}></div>
                </div>
            </div>

            {error && (
                <div style={{ position: 'absolute', top: '10%', left: 0, right: 0, padding: '16px', color: '#ef4444', textAlign: 'center', background: 'rgba(255,255,255,0.9)' }}>
                    {error}
                </div>
            )}

            <button
                onClick={onStop}
                style={{
                    position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    color: 'white', fontSize: '24px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default Scanner;

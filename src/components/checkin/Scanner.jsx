import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const Scanner = ({ onScan, isScanning, onStop }) => {
    const scannerRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let html5QrCode;

        const startScanner = async () => {
            try {
                html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                    },
                    (decodedText) => {
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // ignore scan errors
                    }
                );
            } catch (err) {
                console.error("Camera error", err);
                setError("Camera permission denied or not available.");
            }
        };

        if (isScanning) {
            // slight delay to ensure cleanup of previous
            setTimeout(() => startScanner(), 100);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(err => console.log('Stop failed', err));
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        };
    }, [isScanning, onScan]);

    if (!isScanning) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center">
            <div id="reader" style={{ width: '100%', maxWidth: '500px', height: '100vh', background: 'black' }}></div>

            {error && (
                <div className="absolute top-20 left-0 right-0 text-center text-red-500 bg-white p-2">
                    {error}
                </div>
            )}

            <button
                onClick={onStop}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 p-4 rounded-full bg-red-600 text-white font-bold shadow-lg z-50"
                style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                ✕
            </button>

            {/* Overlay Guide */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none border-2 border-white/30" style={{ zIndex: 45 }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', border: '2px solid var(--color-primary)', borderRadius: '12px', boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)' }}></div>
            </div>
        </div>
    );
};

export default Scanner;

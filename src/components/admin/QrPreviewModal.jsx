import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Modal from '../common/Modal';

const QrPreviewModal = ({ isOpen, onClose, attendee, eventCode }) => {
    const canvasRef = useRef(null);
    const [dataUrl, setDataUrl] = useState(null);

    useEffect(() => {
        if (isOpen && attendee && canvasRef.current) {
            generateTicket();
        }
    }, [isOpen, attendee, eventCode]);

    const generateTicket = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Config
        const W = 1080;
        const H = 1920;
        canvas.width = W;
        canvas.height = H;

        // Background
        // Gradient background for premium feel, but ensure QR contrast
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#f8fafc'); // Very light
        grad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Header
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EVENT TICKET', W / 2, 200);

        ctx.font = '40px Inter, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('受付でこの画面を提示してください', W / 2, 280);

        // QR Code
        const qrData = `${eventCode || ''}:${attendee.id}`;
        try {
            // 2026:ID format
            const qrUrl = await QRCode.toDataURL(qrData, {
                width: 800,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff00' } // Transparent bg for QR itself to blend? No, QR readers like white bg.
            });
            // Better to have white box behind QR
            const qrSize = 800;
            const qrY = 500;

            // White container box for QR
            ctx.shadowColor = "rgba(0,0,0,0.1)";
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            // rounded rect
            const r = 40;
            const x = (W - qrSize) / 2 - 40;
            const y = qrY - 40;
            const w = qrSize + 80;
            const h = qrSize + 80;
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();
            ctx.shadowBlur = 0;

            const img = new Image();
            img.src = qrUrl;
            img.onload = () => {
                ctx.drawImage(img, (W - qrSize) / 2, qrY, qrSize, qrSize);

                // Name
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 90px Inter, sans-serif'; // Big Name
                ctx.fillText(attendee.name, W / 2, qrY + qrSize + 160);

                // Email
                ctx.fillStyle = '#64748b';
                ctx.font = '40px Inter, sans-serif';
                ctx.fillText(attendee.email || '', W / 2, qrY + qrSize + 240);

                // Footer ID
                ctx.font = '30px monospace';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText(`ID: ${attendee.id}`, W / 2, H - 100);

                setDataUrl(canvas.toDataURL('image/png'));
            };
        } catch (err) {
            console.error(err);
        }
    };

    const download = () => {
        if (!dataUrl) return;
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `ticket_${attendee.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="チケット生成">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {dataUrl ? (
                    <>
                        <img
                            src={dataUrl}
                            alt="Ticket Preview"
                            style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                        />
                        <button className="btn btn-primary" onClick={download}>
                            画像をダウンロード (PNG)
                        </button>
                    </>
                ) : (
                    <div>生成中...</div>
                )}
            </div>
        </Modal>
    );
};

export default QrPreviewModal;

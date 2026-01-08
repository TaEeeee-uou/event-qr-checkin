import React, { useState, useEffect, useRef, useMemo } from 'react';
import Scanner from './Scanner';
import CheckInCounters from './CheckInCounters';
import ActionLog from './ActionLog';
import { ApiUtils } from '../../services/api';
import { StorageUtils } from '../../services/storage';

const CheckInDashboard = ({
    attendees,
    setAttendees, // local update
    addLog,
    logs,
    onSync,
    config
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null); // { status: 'success'|'error'|'warn', message, name }
    const [manualId, setManualId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [lastCheckInId, setLastCheckInId] = useState(null);

    // Maps for fast lookup
    const attendeesMap = useRef(new Map());
    useEffect(() => {
        attendeesMap.current = new Map(attendees.map(a => [a.id, a]));
    }, [attendees]);

    const handleScan = async (decodedText) => {
        if (processing || scanResult) return; // Lock
        setProcessing(true);

        try {
            // 1. Parse
            // Expected: EVENT_CODE:ID
            const parts = decodedText.split(':');
            if (parts.length < 2) {
                throw new Error("フォーマット不正");
            }
            const code = parts[0];
            const id = parts[1];

            // 2. Event Code Check
            if (config.eventCode && code !== config.eventCode) {
                showResult('error', 'イベントコード不一致', `Code: ${code}`);
                return;
            }

            // 3. Local Lookup
            const attendee = attendeesMap.current.get(id);
            if (!attendee) {
                showResult('error', '該当者なし', `ID: ${id}`);
                // Log it anyway?
                addLog({ ts: new Date().toISOString(), id, result: 'error', message: '名簿にありません' });
                return;
            }

            if (attendee.status === 'inactive') {
                showResult('error', '無効な参加者', attendee.name);
                addLog({ ts: new Date().toISOString(), name: attendee.name, result: 'error', message: '無効ステータス' });
                return;
            }

            // 4. Check already checked in
            if (attendee.status === 'checked_in') {
                showResult('warn', '受付済みです', attendee.name);
                // setLastCheckInId(id); // Allow undo? Maybe.
                addLog({ ts: new Date().toISOString(), name: attendee.name, result: 'warn', message: '既に受付済' });
                return;
            }

            // 5. Success Flow
            // Optimistic Update
            const updatedList = attendees.map(a => a.id === id ? { ...a, status: 'checked_in', checked_in_at: new Date().toISOString() } : a);
            setAttendees(updatedList);
            StorageUtils.saveAttendees(updatedList);

            showResult('success', '受付完了!', attendee.name);
            setLastCheckInId(id);
            addLog({ ts: new Date().toISOString(), name: attendee.name, result: 'success', message: 'チェックイン完了' });

            // Async API Call
            ApiUtils.checkIn(id, config).then(res => {
                if (!res.ok) console.warn("Background check-in sync failed", res);
            });

        } catch (err) {
            showResult('error', 'エラー', err.message);
        } finally {
            // setProcessing(false) happens after timeout in showResult
        }
    };

    const showResult = (status, title, message) => {
        setScanResult({ status, title, message });

        // Play sound?
        // auto clear
        setTimeout(() => {
            setScanResult(null);
            setProcessing(false);
        }, 1500);
    };

    const handleManualCheckIn = () => {
        if (!manualId) return;
        handleScan(`${config.eventCode || 'EVENT'}:${manualId}`); // Simulate scan format or just ID check
        setManualId('');
    };

    const handleUndo = async () => {
        if (!lastCheckInId) return;
        const id = lastCheckInId;

        if (!window.confirm("直前のチェックインを取り消しますか？")) return;

        // Local Undo
        const updatedList = attendees.map(a => a.id === id ? { ...a, status: 'not_yet', checked_in_at: null } : a);
        setAttendees(updatedList);
        StorageUtils.saveAttendees(updatedList);

        addLog({ ts: new Date().toISOString(), id, result: 'undo', message: '取り消し実行' });
        setLastCheckInId(null);

        await ApiUtils.undoCheckIn(id, config);
    };

    // Merge sync data into logs
    const mergedLogs = useMemo(() => {
        // 1. Generate success logs from current attendee state (Synced data)
        const successLogs = attendees
            .filter(a => a.status === 'checked_in' && a.checked_in_at)
            .map(a => ({
                ts: a.checked_in_at,
                name: a.name,
                result: 'success',
                message: '受付済'
            }));

        // 2. Local logs (Errors, Warnings, Undos only)
        // Filter out local success logs to avoid duplication with the state-based ones above
        const otherLogs = logs.filter(l => l.result !== 'success' && l.result !== 'checked_in');

        // 3. Combine and Sort by time desc
        return [...successLogs, ...otherLogs].sort((a, b) => new Date(b.ts) - new Date(a.ts));
    }, [attendees, logs]);

    return (
        <div className="container animate-spawn" style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
            {/* Counters */}
            <CheckInCounters attendees={attendees} />

            {/* Main Actions */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                    className="btn btn-primary"
                    style={{ padding: '24px', fontSize: '1.2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
                    onClick={() => setIsScanning(true)}
                >
                    📷 QRコードをスキャン
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        placeholder="手動入力: ID検索"
                        value={manualId}
                        onChange={e => setManualId(e.target.value)}
                    />
                    <button className="btn" onClick={handleManualCheckIn}>実行</button>
                </div>

                {lastCheckInId && (
                    <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)' }} onClick={handleUndo}>
                        直前のチェックインを取り消す (Undo)
                    </button>
                )}
            </div>

            {/* Log */}
            <ActionLog logs={mergedLogs} />

            {/* Scanner & Result Layers */}
            <Scanner
                isScanning={isScanning}
                onScan={handleScan}
                onStop={() => setIsScanning(false)}
            />

            {scanResult && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60,
                    background: scanResult.status === 'success' ? 'rgba(16, 185, 129, 0.9)' : (scanResult.status === 'warn' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(239, 68, 68, 0.9)'),
                    backdropFilter: 'blur(8px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'white', animation: 'fadeIn 0.2s'
                }}>
                    <div style={{ fontSize: '4rem' }}>
                        {scanResult.status === 'success' ? '✓' : (scanResult.status === 'warn' ? '!' : '✕')}
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: '16px 0', textAlign: 'center' }}>{scanResult.title}</h1>
                    <p style={{ fontSize: '1.5rem' }}>{scanResult.message}</p>
                </div>
            )}
        </div>
    );
};

export default CheckInDashboard;

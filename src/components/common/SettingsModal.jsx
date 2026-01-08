import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ApiUtils } from '../../services/api';

const SettingsModal = ({ isOpen, onClose, config, onSave }) => {
    const [formData, setFormData] = useState({ ...config });
    const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }

    useEffect(() => {
        if (isOpen) {
            setFormData({ ...config });
            setStatus(null);
        }
    }, [isOpen, config]);

    const handleChange = (field, val) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    const handleTest = async () => {
        setStatus({ type: 'info', msg: 'テスト中...' });
        try {
            const res = await ApiUtils.ping(formData);
            if (res.ok) {
                setStatus({ type: 'success', msg: '接続成功! ' + (res.event_code ? `イベント: ${res.event_code}` : '') });
                if (res.event_code) {
                    setFormData(prev => ({ ...prev, eventCode: res.event_code }));
                }
            } else {
                setStatus({ type: 'error', msg: '失敗: ' + (res.error || '不明なエラー') });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'エラー: ' + err.message });
        }
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="アプリ設定">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>GAS Webアプリ URL</label>
                    <input
                        value={formData.webappUrl}
                        onChange={e => handleChange('webappUrl', e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>APIトークン</label>
                    <input
                        type="password"
                        value={formData.apiToken}
                        onChange={e => handleChange('apiToken', e.target.value)}
                        placeholder="秘密のトークン"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>イベントコード (任意)</label>
                    <input
                        value={formData.eventCode}
                        onChange={e => handleChange('eventCode', e.target.value)}
                        placeholder="EVENT2026"
                    />
                </div>

                {status && (
                    <div style={{
                        padding: '8px', borderRadius: '8px', fontSize: '0.9rem',
                        background: status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : (status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'),
                        color: status.type === 'error' ? 'var(--color-danger)' : (status.type === 'success' ? 'var(--color-success)' : 'white')
                    }}>
                        {status.msg}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <button className="btn" onClick={handleTest}>接続テスト</button>
                    <button className="btn btn-success" onClick={handleSave}>保存する</button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;

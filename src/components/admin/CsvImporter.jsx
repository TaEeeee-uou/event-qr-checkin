import React, { useState } from 'react';

const CsvImporter = ({ onImport, isImporting }) => {
    const [text, setText] = useState('');
    const [preview, setPreview] = useState([]);

    const parseCsv = (csvText) => {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        // Simple parser
        const parsed = lines.map(line => {
            // Handle simple CSV (no complex quotes support for simplicity unless needed)
            // If we find quotes, we might need a regex
            // But let's assume standard CSV for now: name,email,note
            const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            return cols;
        });

        // Detect header
        const first = parsed[0];
        const hasHeader = (first[0] || '').toLowerCase() === 'name' || (first[0] || '').toLowerCase() === 'id';

        let rows = hasHeader ? parsed.slice(1) : parsed;

        // Map to objects
        return rows.map(cols => {
            // order: name, email, note
            return {
                name: cols[0] || '',
                email: cols[1] || '',
                note: cols[2] || '',
                status: 'not_yet' // default
            };
        }).filter(r => r.name);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
        setPreview(parseCsv(e.target.value));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target.result;
            setText(content);
            setPreview(parseCsv(content));
        };
        reader.readAsText(file);
    };

    const executeImport = () => {
        if (preview.length === 0) return;
        onImport(preview);
        setText('');
        setPreview([]);
    };

    return (
        <div className="glass-panel" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Import Attendees</h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ fontSize: '0.9rem' }} />
            </div>

            <textarea
                className="glass-panel"
                style={{ width: '100%', height: '100px', background: 'transparent', resize: 'vertical' }}
                placeholder="Paste CSV here (Name, Email, Note)"
                value={text}
                onChange={handleTextChange}
            />

            {preview.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                        Preview: {preview.length} rows detected
                    </div>
                    <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '4px' }}>
                        {preview.slice(0, 5).map((r, i) => (
                            <div key={i}>{r.name} ({r.email})</div>
                        ))}
                        {preview.length > 5 && <div>...</div>}
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <button
                    className="btn btn-primary"
                    disabled={preview.length === 0 || isImporting}
                    onClick={executeImport}
                >
                    {isImporting ? 'Importing...' : 'Sync to Database'}
                </button>
            </div>
        </div>
    );
};

export default CsvImporter;

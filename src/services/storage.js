const KEYS = {
    CONFIG: 'eqc_config',
    ATTENDEES: 'eqc_attendees',
    LOGS: 'eqc_logs',
    SYNC_INFO: 'eqc_sync_info'
};

export const StorageUtils = {
    // Config
    getConfig: () => {
        try {
            return JSON.parse(localStorage.getItem(KEYS.CONFIG)) || {
                webappUrl: '',
                apiToken: '',
                eventCode: ''
            };
        } catch {
            return { webappUrl: '', apiToken: '', eventCode: '' };
        }
    },
    saveConfig: (config) => {
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    },

    // Attendees
    getAttendees: () => {
        try {
            return JSON.parse(localStorage.getItem(KEYS.ATTENDEES)) || [];
        } catch {
            return [];
        }
    },
    saveAttendees: (list) => {
        localStorage.setItem(KEYS.ATTENDEES, JSON.stringify(list));
    },

    // Logs (Max 100)
    getLogs: () => {
        try {
            return JSON.parse(localStorage.getItem(KEYS.LOGS)) || [];
        } catch {
            return [];
        }
    },
    addLog: (logItem) => {
        const current = StorageUtils.getLogs();
        // Add new at beginning
        const updated = [logItem, ...current].slice(0, 100);
        localStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
        return updated;
    },
    clearLogs: () => {
        localStorage.removeItem(KEYS.LOGS);
    },

    // Sync Info
    getSyncInfo: () => {
        try {
            return JSON.parse(localStorage.getItem(KEYS.SYNC_INFO)) || { lastSyncedAt: null };
        } catch {
            return { lastSyncedAt: null };
        }
    },
    updateSyncTime: () => {
        const info = { lastSyncedAt: new Date().toISOString() };
        localStorage.setItem(KEYS.SYNC_INFO, JSON.stringify(info));
        return info;
    }
};

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/common/Header';
import StatusBanner from './components/common/StatusBanner';
import SettingsModal from './components/common/SettingsModal';
import AdminDashboard from './components/admin/AdminDashboard';
import CheckInDashboard from './components/checkin/CheckInDashboard';
import { StorageUtils } from './services/storage';
import { ApiUtils } from './services/api';

function App() {
  const [mode, setModeState] = useState('checkin'); // admin | checkin
  const [config, setConfig] = useState(StorageUtils.getConfig());
  const [attendees, setAttendees] = useState(StorageUtils.getAttendees());
  const [logs, setLogs] = useState(StorageUtils.getLogs());
  const [syncInfo, setSyncInfo] = useState(StorageUtils.getSyncInfo());

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // URL Mode Sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    if (m === 'admin' || m === 'checkin') {
      setModeState(m);
    }
  }, []);

  const setMode = (m) => {
    setModeState(m);
    const url = new URL(window.location);
    url.searchParams.set('mode', m);
    window.history.pushState({}, '', url);
  };

  // Persist Data on Change (Optimized: usually inside specific handlers, but strict effect is safe for small apps)
  // Actually, handlers update storage directly for atomic consistency, but state triggers re-render.
  // We used StorageUtils inside CheckInDashboard for atomic updates.
  // Here we primarily ensuring State matches Storage on mount.

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    StorageUtils.saveConfig(newConfig);
  };

  const handleAddLog = (logItem) => {
    const newLogs = StorageUtils.addLog(logItem);
    setLogs(newLogs);
  };

  const syncAttendees = useCallback(async () => {
    if (isSyncing) return;
    if (!config.webappUrl || !config.apiToken) {
      setSyncError("Config Missing");
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await ApiUtils.getAttendees(config);
      if (res.ok) {
        // Merge strategy? 
        // Server is truth usually. But we might have pending checkins?
        // For simplicity: Replace local with server, OR if we want to be safe, we merge.
        // Given spec: "Admin mode -> Sync", "Checkin mode -> Checkin API".
        // If we CheckIn locally, we update local immediately. The server should eventually match.
        // If we pull from server, we might overwrite local "just checked in" if server hasn't processed it yet?
        // Risk: Race condition.
        // Mitigation: We rely on server being truth. If request pending, UI optimistically reflects it.
        // If we pull stale data, UI flips back. 
        // Ideally: checkin API returns updated status.
        // For `getAttendees`: it returns list.
        setAttendees(res.attendees);
        StorageUtils.saveAttendees(res.attendees);

        const info = StorageUtils.updateSyncTime();
        setSyncInfo(info);
      } else {
        setSyncError(res.error || "Sync Failed");
      }
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [config, isSyncing]);

  // If no config, open settings
  useEffect(() => {
    if (!config.webappUrl) {
      setIsSettingsOpen(true);
    }
  }, [config.webappUrl]);

  return (
    <div className="App">
      <Header currentMode={mode} setMode={setMode} onOpenSettings={() => setIsSettingsOpen(true)} />

      <StatusBanner
        lastSyncedAt={syncInfo.lastSyncedAt}
        isSyncing={isSyncing}
        onSync={syncAttendees}
        error={syncError}
      />

      <main style={{ paddingBottom: '40px' }}>
        {mode === 'admin' ? (
          <AdminDashboard
            attendees={attendees}
            setAttendees={setAttendees}
            onSync={syncAttendees}
            config={config}
            isSyncing={isSyncing}
          />
        ) : (
          <CheckInDashboard
            attendees={attendees}
            setAttendees={setAttendees}
            addLog={handleAddLog}
            logs={logs}
            config={config}
            onSync={syncAttendees} // for auto-sync
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}

export default App;

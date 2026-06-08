'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotificationSettings {
  enabled: boolean;
  morning_enabled: boolean;
  morning_time: string;
  evening_enabled: boolean;
  evening_time: string;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  morning_enabled: true,
  morning_time: '08:00',
  evening_enabled: true,
  evening_time: '20:00',
};

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-7 w-12 flex-shrink-0 rounded-full border-2 transition-colors duration-200"
      style={{
        background: checked ? 'var(--gold-primary)' : 'var(--bg-elevated)',
        borderColor: checked ? 'var(--gold-primary)' : 'var(--border)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      <span
        className="pointer-events-none inline-block h-5 w-5 rounded-full shadow transition-transform duration-200"
        style={{
          background: 'white',
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
          marginTop: '1px',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  async function loadSettings() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSettings({
        enabled: data.enabled,
        morning_enabled: data.morning_enabled,
        morning_time: data.morning_time,
        evening_enabled: data.evening_enabled,
        evening_time: data.evening_time,
      });
    }
    setLoading(false);
  }

  async function urlBase64ToUint8Array(base64String: string): Promise<Uint8Array> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('A böngésző nem támogatja a push értesítéseket.');
      return null;
    }

    let reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const applicationServerKey = (await urlBase64ToUint8Array(vapidKey)).buffer as ArrayBuffer;

    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    return await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  }

  async function handleEnableToggle(enabled: boolean) {
    setError('');
    setSaving(true);

    if (enabled) {
      // Request permission first
      if (!('Notification' in window)) {
        setError('A böngésző nem támogatja az értesítéseket.');
        setSaving(false);
        return;
      }

      let perm = Notification.permission;
      if (perm === 'denied') {
        setError('Az értesítések le vannak tiltva ebben a böngészőben. Engedélyezd a telefon beállításaiban a Hermetic Path alkalmazásnál.');
        setSaving(false);
        return;
      }

      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
      }

      setPermissionState(perm);
      if (perm !== 'granted') {
        setError('Értesítési engedély megtagadva.');
        setSaving(false);
        return;
      }

      const subscription = await subscribeToPush();
      if (!subscription) {
        setSaving(false);
        return;
      }

      // Save subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (!res.ok) {
        setError('Nem sikerült menteni az értesítési előfizetést.');
        setSaving(false);
        return;
      }
    } else {
      // Unsubscribe
      const reg = await navigator.serviceWorker?.getRegistration('/sw.js');
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      await fetch('/api/push/subscribe', { method: 'DELETE' });
    }

    const newSettings = { ...settings, enabled };
    await saveSettings(newSettings);
    setSettings(newSettings);
    setSaving(false);
    setStatus(enabled ? 'Értesítések bekapcsolva!' : 'Értesítések kikapcsolva.');
    setTimeout(() => setStatus(''), 3000);
  }

  async function saveSettings(s: NotificationSettings) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('notification_settings').upsert(
      {
        user_id: user.id,
        enabled: s.enabled,
        morning_enabled: s.morning_enabled,
        morning_time: s.morning_time,
        evening_enabled: s.evening_enabled,
        evening_time: s.evening_time,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  }

  async function handleSettingChange(patch: Partial<NotificationSettings>) {
    const newSettings = { ...settings, ...patch };
    setSettings(newSettings);
    setSaving(true);
    await saveSettings(newSettings);
    setSaving(false);
    setStatus('Mentve.');
    setTimeout(() => setStatus(''), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-crimson" style={{ color: 'var(--text-secondary)' }}>Betöltés...</div>
      </div>
    );
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-cinzel" style={{ color: 'var(--gold-primary)' }}>Beállítások</h1>
      </div>

      {/* iOS not standalone warning */}
      {isIOS && !isStandalone && (
        <div className="mb-6 p-4 rounded-lg font-crimson text-sm"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold-primary)' }}>
          <strong>Fontos:</strong> iOS-on a push értesítések csak akkor működnek, ha az alkalmazás <strong>hozzá van adva a főképernyőhöz</strong> (PWA mód). Nyisd meg a Megosztás menüt és válaszd a "Főképernyőre adás" lehetőséget.
        </div>
      )}

      {/* Notifications section */}
      <div className="card-glass p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-cinzel text-lg" style={{ color: 'var(--text-primary)' }}>Push értesítések</h2>
            <p className="font-crimson text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Emlékeztetők, ha a napi gyakorlás még nem történt meg
            </p>
          </div>
          <Toggle
            checked={settings.enabled}
            onChange={handleEnableToggle}
            disabled={saving || permissionState === 'denied'}
          />
        </div>

        {permissionState === 'denied' && (
          <p className="font-crimson text-sm mt-3" style={{ color: 'var(--fire)' }}>
            Az értesítések tiltva vannak. Engedélyezd a telefon beállításaiban a Hermetic Path alkalmazásnál.
          </p>
        )}

        {error && (
          <p className="font-crimson text-sm mt-3" style={{ color: 'var(--fire)' }}>{error}</p>
        )}

        {status && (
          <p className="font-crimson text-sm mt-3" style={{ color: 'var(--body-track)' }}>✓ {status}</p>
        )}
      </div>

      {/* Morning / Evening toggles */}
      {settings.enabled && (
        <div className="space-y-4">
          {/* Morning */}
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">☀</span>
                <div>
                  <h3 className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>Reggeli emlékeztető</h3>
                  <p className="font-crimson text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Ha reggeli idejéig még 0 elvégzett gyakorlat van
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.morning_enabled}
                onChange={(v) => handleSettingChange({ morning_enabled: v })}
                disabled={saving}
              />
            </div>
            {settings.morning_enabled && (
              <div className="flex items-center gap-3 mt-3">
                <label className="font-crimson text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Emlékeztető ideje:
                </label>
                <input
                  type="time"
                  value={settings.morning_time}
                  onChange={(e) => handleSettingChange({ morning_time: e.target.value })}
                  className="rounded px-3 py-1.5 font-crimson text-sm"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Evening */}
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">☽</span>
                <div>
                  <h3 className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>Esti emlékeztető</h3>
                  <p className="font-crimson text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Ha esti gyakorlat még nincs elvégezve, illetve napi egyszeri is
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.evening_enabled}
                onChange={(v) => handleSettingChange({ evening_enabled: v })}
                disabled={saving}
              />
            </div>
            {settings.evening_enabled && (
              <div className="flex items-center gap-3 mt-3">
                <label className="font-crimson text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Emlékeztető ideje:
                </label>
                <input
                  type="time"
                  value={settings.evening_time}
                  onChange={(e) => handleSettingChange({ evening_time: e.target.value })}
                  className="rounded px-3 py-1.5 font-crimson text-sm"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="p-4 rounded-lg font-crimson text-sm"
            style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--text-secondary)' }}>
            <p className="font-cinzel text-xs mb-2" style={{ color: 'var(--gold-dim)' }}>HOGYAN MŰKÖDIK</p>
            <p>Az értesítések a beállított időpont közelében érkeznek, ha a megfelelő gyakorlat még nem lett elvégezve arra a napra. A reggeli értesítés kb. 06:00 UTC (08:00 Budapest nyáron), az esti kb. 17:00 UTC (19:00 Budapest nyáron) körül ellenőriz.</p>
          </div>
        </div>
      )}
    </div>
  );
}

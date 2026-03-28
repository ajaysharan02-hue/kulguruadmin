import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

const SettingsContext = createContext({
    settings: {},
    loading: true,
    error: null,
    refresh: () => Promise.resolve(),
    setSettings: () => {},
});

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/settings');
            setSettings(res?.data?.data || {});
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const value = useMemo(
        () => ({
            settings,
            loading,
            error,
            refresh: fetchSettings,
            setSettings, // expose setter so pages like Settings can update local state then save
        }),
        [settings, loading, error]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    return useContext(SettingsContext);
}


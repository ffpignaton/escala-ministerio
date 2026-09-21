import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialMinisters, initialMasses, ADMIN_PASSWORD_HASH, hashPassword } from '../data/initialData';

const AppContext = createContext(null);

const STORAGE_KEY = 'escala_ministerio_data';
const SERVER_DATA_URL = '/data.json';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function AppProvider({ children }) {
  const [ministers, setMinisters] = useState(initialMinisters);
  const [masses, setMasses] = useState(initialMasses);
  const [schedules, setSchedules] = useState([]);
  const [notices, setNotices] = useState([]);
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isAdmin, setIsAdmin] = useState(false);
  // null = carregando, false = falhou, true = ok
  const [serverLoaded, setServerLoaded] = useState(null);

  // 1. Ao iniciar, tenta carregar do servidor (data.json)
  useEffect(() => {
    fetch(`${SERVER_DATA_URL}?_=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((serverData) => {
        // Para notices e darkMode, preserva o localStorage se o servidor não tiver
        const stored = loadFromStorage();
        if (serverData.ministers) setMinisters(serverData.ministers);
        if (serverData.masses) setMasses(serverData.masses);
        if (serverData.schedules) setSchedules(serverData.schedules);
        const finalNotices = serverData.notices ?? stored?.notices ?? [];
        setNotices(finalNotices);
        saveToStorage({
          ministers: serverData.ministers ?? initialMinisters,
          masses: serverData.masses ?? initialMasses,
          schedules: serverData.schedules ?? [],
          notices: finalNotices,
          darkMode,
        });
        setServerLoaded(true);
      })
      .catch(() => {
        // Sem servidor ou erro → usa localStorage como fallback
        const stored = loadFromStorage();
        if (stored) {
          if (stored.ministers) setMinisters(stored.ministers);
          if (stored.masses) setMasses(stored.masses);
          if (stored.schedules) setSchedules(stored.schedules);
          if (stored.notices) setNotices(stored.notices);
          if (stored.darkMode !== undefined) setDarkMode(stored.darkMode);
        }
        setServerLoaded(false);
      });
  }, []);

  // 2. Persiste edições do admin no localStorage
  useEffect(() => {
    if (serverLoaded === null) return;
    saveToStorage({ ministers, masses, schedules, notices, darkMode });
  }, [ministers, masses, schedules, notices, darkMode, serverLoaded]);

  // Aplica classe dark no html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Auth
  const login = useCallback(async (password) => {
    const hash = await hashPassword(password);
    if (hash === ADMIN_PASSWORD_HASH) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setIsAdmin(false), []);

  // Ministers CRUD
  const addMinister = useCallback((minister) => {
    const newM = { ...minister, id: crypto.randomUUID() };
    setMinisters((prev) => [...prev, newM]);
    return newM;
  }, []);

  const updateMinister = useCallback((id, data) => {
    setMinisters((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }, []);

  const removeMinister = useCallback((id) => {
    setMinisters((prev) => prev.filter((m) => m.id !== id));
    setSchedules((prev) =>
      prev.map((s) => ({ ...s, ministerIds: s.ministerIds.filter((mid) => mid !== id) }))
    );
  }, []);

  // Masses CRUD
  const addMass = useCallback((mass) => {
    const newM = { ...mass, id: crypto.randomUUID() };
    setMasses((prev) => [...prev, newM]);
    return newM;
  }, []);

  const updateMass = useCallback((id, data) => {
    setMasses((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }, []);

  const removeMass = useCallback((id) => {
    setMasses((prev) => prev.filter((m) => m.id !== id));
    setSchedules((prev) => prev.filter((s) => s.massId !== id));
  }, []);

  // Schedules CRUD
  const upsertSchedule = useCallback((schedule) => {
    setSchedules((prev) => {
      const exists = prev.find((s) => s.id === schedule.id);
      if (exists) return prev.map((s) => (s.id === schedule.id ? schedule : s));
      return [...prev, { ...schedule, id: crypto.randomUUID() }];
    });
  }, []);

  const removeSchedule = useCallback((id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Notices CRUD
  const addNotice = useCallback((notice) => {
    setNotices((prev) => [...prev, { ...notice, id: crypto.randomUUID() }]);
  }, []);
  const updateNotice = useCallback((id, data) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
  }, []);
  const removeNotice = useCallback((id) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Exporta JSON genérico (backup)
  const exportData = useCallback(() => {
    downloadJson({ ministers, masses, schedules, notices }, `escala-ministerio-${new Date().toISOString().slice(0, 10)}.json`);
  }, [ministers, masses, schedules, notices]);

  // Publica automaticamente via Vercel Serverless Function → GitHub API
  const publishData = useCallback(async () => {
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ministers, masses, schedules, notices }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao publicar');
    }
    return true;
  }, [ministers, masses, schedules]);

  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.ministers) setMinisters(data.ministers);
          if (data.masses) setMasses(data.masses);
          if (data.schedules) setSchedules(data.schedules);
          resolve();
        } catch {
          reject(new Error('Arquivo inválido'));
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ministers,
        masses,
        schedules,
        notices,
        darkMode,
        setDarkMode,
        isAdmin,
        serverLoaded,
        login,
        logout,
        addMinister,
        updateMinister,
        removeMinister,
        addMass,
        updateMass,
        removeMass,
        upsertSchedule,
        removeSchedule,
        exportData,
        publishData,
        importData,
        addNotice,
        updateNotice,
        removeNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

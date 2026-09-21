import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialMinisters, initialMasses, initialSchedules, ADMIN_PASSWORD_HASH, hashPassword } from '../data/initialData';

const AppContext = createContext(null);

const STORAGE_KEY = 'escala_ministerio_data';

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
  const [ministers, setMinisters] = useState(() => {
    const stored = loadFromStorage();
    return stored?.ministers ?? initialMinisters;
  });
  const [masses, setMasses] = useState(() => {
    const stored = loadFromStorage();
    return stored?.masses ?? initialMasses;
  });
  const [schedules, setSchedules] = useState(() => {
    const stored = loadFromStorage();
    return stored?.schedules ?? initialSchedules;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const stored = loadFromStorage();
    return stored?.darkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Persiste tudo no localStorage
  useEffect(() => {
    saveToStorage({ ministers, masses, schedules, darkMode });
  }, [ministers, masses, schedules, darkMode]);

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

  // Export/Import
  const exportData = useCallback(() => {
    const data = JSON.stringify({ ministers, masses, schedules }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escala-ministerio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        darkMode,
        setDarkMode,
        isAdmin,
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
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

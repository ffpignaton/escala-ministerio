import { useState } from 'react';
import { Sun, Moon, Search, ShieldCheck, X, Printer, Filter } from 'lucide-react';
import { useApp } from './context/AppContext';
import Calendar from './components/Calendar';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const { ministers, masses, darkMode, setDarkMode, isAdmin } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [filterMassId, setFilterMassId] = useState('');

  // Abre painel admin automaticamente após login bem-sucedido
  function handleLoginClose(loggedIn) {
    setShowLogin(false);
    if (loggedIn) setShowAdmin(true);
  }

  // Quando já está logado, abre direto
  function handleAdminClick() {
    if (isAdmin) {
      setShowAdmin(true);
    } else {
      setShowLogin(true);
    }
  }

  // Ministro selecionado pela busca
  const selectedMinister = ministers.find(
    (m) => m.name.toLowerCase() === searchName.toLowerCase()
  );

  const filteredMinisterId = selectedMinister?.id ?? null;
  const suggestions = searchName.length >= 2
    ? ministers.filter((m) =>
        m.active && m.name.toLowerCase().includes(searchName.toLowerCase())
      )
    : [];

  function printSchedule() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm print:hidden">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
              <span className="text-white text-lg">✝</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                Ministros de Eucaristia
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Escala de Ministros</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={printSchedule}
              title="Imprimir / Salvar PDF"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Alternar modo escuro"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="max-w-2xl mx-auto px-4 py-4 print:hidden">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Busca por ministro */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Buscar minha escala..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
            />
            {searchName && (
              <button
                onClick={() => setSearchName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Autocomplete */}
            {suggestions.length > 0 && !selectedMinister && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg z-10 overflow-hidden">
                {suggestions.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSearchName(m.name)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtro por missa */}
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterMassId}
              onChange={(e) => setFilterMassId(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Todas as missas</option>
              {masses.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Badge do ministro selecionado */}
        {selectedMinister && (
          <div className="mt-2 flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Mostrando escala de <strong>{selectedMinister.name}</strong>
            <button onClick={() => setSearchName('')} className="ml-auto text-purple-400 hover:text-purple-600 dark:hover:text-purple-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Calendário */}
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 print:shadow-none print:border-none">
          <Calendar
            filterMinisterId={filteredMinisterId}
            filterMassId={filterMassId || null}
          />
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 print:hidden">
          Paróquia • Sistema de Escalas de Ministros
        </p>
      </main>

      {/* Modais */}
      {showLogin && <AdminLogin onClose={handleLoginClose} />}
      {showAdmin && isAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

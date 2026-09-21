import { useState } from 'react';
import { ShieldCheck, Filter, User } from 'lucide-react';
import { useApp } from './context/AppContext';
import Calendar from './components/Calendar';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ExportPDF from './components/ExportPDF';
import { NoticesSection, BirthdaysSection } from './components/InfoSections';
import MinisterScheduleModal from './components/MinisterScheduleModal';

export default function App() {
  const { ministers, masses, isAdmin } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedMinisterId, setSelectedMinisterId] = useState('');
  const [showMinisterModal, setShowMinisterModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterMassId, setFilterMassId] = useState('');

  function handleLoginClose(loggedIn) {
    setShowLogin(false);
    if (loggedIn) setShowAdmin(true);
  }

  function handleAdminClick() {
    if (isAdmin) setShowAdmin(true);
    else setShowLogin(true);
  }

  function handleMinisterChange(e) {
    const id = e.target.value;
    setSelectedMinisterId(id);
    if (id) setShowMinisterModal(true);
  }

  const selectedMinister = ministers.find((m) => m.id === selectedMinisterId) ?? null;
  const activeMinsters = ministers.filter((m) => m.active).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm print:hidden">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo Paróquia Santíssima Trindade" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            <div>
              <p className="text-xs leading-tight" style={{color:'#8B6340'}}>
                Paróquia Santíssima Trindade - Matriz São Jorge
              </p>
              <p className="text-xs leading-tight" style={{color:'#8B6340'}}>
                Ministros Extraordinários da Distribuição da Sagrada Comunhão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportPDF currentMonth={currentMonth} />
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

          {/* Select de ministro */}
          <div className="flex-1 relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedMinisterId}
              onChange={handleMinisterChange}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Ver minha escala...</option>
              {activeMinsters.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro por missa */}
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterMassId}
              onChange={(e) => setFilterMassId(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Todas as missas</option>
              {masses.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <main className="max-w-2xl mx-auto px-4 pb-8">
        <NoticesSection />
        <BirthdaysSection currentMonth={currentMonth} />
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 print:shadow-none print:border-none">
          <Calendar
            filterMinisterId={null}
            filterMassId={filterMassId || null}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-gray-400 mt-6 print:hidden">
          Paróquia • Sistema de Escalas de Ministros
        </p>
      </main>

      {/* Modais */}
      {showLogin && <AdminLogin onClose={handleLoginClose} />}
      {showAdmin && isAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showMinisterModal && selectedMinister && (
        <MinisterScheduleModal
          minister={selectedMinister}
          onClose={() => { setShowMinisterModal(false); setSelectedMinisterId(''); }}
        />
      )}
    </div>
  );
}

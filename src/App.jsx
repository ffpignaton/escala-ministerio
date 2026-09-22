import { useState } from 'react';
import { ShieldCheck, User, FileText } from 'lucide-react';
import { useApp } from './context/AppContext';
import Calendar from './components/Calendar';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ExportPDF from './components/ExportPDF';
import { NoticesSection, BirthdaysSection } from './components/InfoSections';
import MinisterScheduleModal from './components/MinisterScheduleModal';

export default function App() {
  const { ministers, isAdmin } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedMinisterId, setSelectedMinisterId] = useState('');
  const [showMinisterModal, setShowMinisterModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    <div className="min-h-screen" style={{backgroundColor:'var(--cream)'}}>

      {/* ── HEADER ── */}
      <header className="print:hidden" style={{backgroundColor:'var(--brown-dark)', borderBottom:'3px solid var(--gold)'}}>
        {/* Faixa dourada superior */}
        <div style={{backgroundColor:'var(--gold)', height:4}} />

        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Logo esquerda — Paróquia São Jorge */}
            <img
              src="/logo.png"
              alt="Logo Paróquia Santíssima Trindade"
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              style={{border:'2px solid var(--gold)', boxShadow:'0 0 0 3px var(--brown-dark), 0 0 0 5px var(--gold)'}}
            />
            {/* Textos centrais */}
            <div className="flex-1 min-w-0 text-center">
              <p style={{fontFamily:"'Cinzel', serif", color:'var(--gold)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase'}}>
                Paróquia Santíssima Trindade · Matriz São Jorge
              </p>
              <p style={{fontFamily:"'EB Garamond', serif", color:'#F5EDE3', fontSize:13, fontStyle:'italic', marginTop:1}}>
                Ministros Extraordinários da Distribuição da Sagrada Comunhão
              </p>
            </div>
            {/* Logo direita — Matriz */}
            <img
              src="/logo.jpg"
              alt="Logo Matriz São Jorge"
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              style={{border:'2px solid var(--gold)', boxShadow:'0 0 0 3px var(--brown-dark), 0 0 0 5px var(--gold)'}}
            />
          </div>
        </div>

        {/* Faixa dourada inferior */}
        <div style={{backgroundColor:'var(--gold)', height:2, opacity:0.6}} />
      </header>

      {/* ── BARRA DE AÇÕES ── */}
      <div className="print:hidden" style={{backgroundColor:'var(--brown)', borderBottom:'1px solid var(--gold)'}}>
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex gap-2 items-center">

          {/* Select ministro */}
          <div className="flex-1 relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:'var(--gold)'}} />
            <select
              value={selectedMinisterId}
              onChange={handleMinisterChange}
              className="w-full pl-8 pr-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none"
              style={{
                backgroundColor:'var(--brown-dark)',
                color:'var(--gold-light)',
                border:'1px solid var(--gold)',
                borderRadius:8,
                fontFamily:"'EB Garamond', serif",
                fontSize:14,
              }}
            >
              <option value="">✦ Ver minha escala...</option>
              {activeMinsters.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* PDF */}
          <ExportPDF currentMonth={currentMonth} />

          {/* Admin */}
          <button
            onClick={handleAdminClick}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium flex-shrink-0 transition-opacity hover:opacity-80"
            style={{
              backgroundColor:'var(--gold)',
              color:'var(--brown-dark)',
              border:'none',
              borderRadius:8,
              fontFamily:"'Cinzel', serif",
              letterSpacing:'0.05em',
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-10">
        <NoticesSection />
        <BirthdaysSection currentMonth={currentMonth} />

        {/* Calendário */}
        <div className="rounded-2xl overflow-hidden" style={{border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(91,53,24,0.08)'}}>
          <Calendar
            filterMinisterId={null}
            filterMassId={null}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        </div>

        {/* Rodapé ornamental */}
        <div className="mt-8 divider-cross text-xs" style={{color:'var(--gold)', fontFamily:"'Cinzel', serif", letterSpacing:'0.1em'}}>
          ✝
        </div>
        <p className="text-center mt-2 text-xs print:hidden" style={{color:'var(--muted)', fontFamily:"'EB Garamond', serif", fontStyle:'italic'}}>
          Paróquia Santíssima Trindade — Vila Capixaba, Cariacica/ES
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

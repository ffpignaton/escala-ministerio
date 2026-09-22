import { useState } from 'react';
import { LogOut, Users, CalendarDays, Clock, Download, Upload, ShieldCheck, Globe, X, FileDown, Megaphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MinistersPanel from './MinistersPanel';
import SchedulesPanel from './SchedulesPanel';
import MassesPanel from './MassesPanel';
import AdminExportPDF from './AdminExportPDF';
import NoticesPanel from './NoticesPanel';

const TABS = [
  { id: 'schedules', label: 'Escalas', icon: CalendarDays },
  { id: 'ministers', label: 'Ministros', icon: Users },
  { id: 'masses', label: 'Missas', icon: Clock },
  { id: 'notices', label: 'Avisos', icon: Megaphone },
  { id: 'pdf', label: 'PDF', icon: FileDown },
];

const BTN = {
  base: {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: '0.05em',
    borderRadius: 7,
    padding: '5px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    border: 'none',
    transition: 'opacity .15s',
  },
  gold: { backgroundColor: 'var(--gold)', color: 'var(--brown-dark)' },
  outline: { backgroundColor: 'transparent', color: 'var(--gold)', border: '1px solid var(--gold)' },
  danger: { backgroundColor: '#8B2222', color: '#FFF5F5' },
};

export default function AdminPanel({ onClose }) {
  const { logout, exportData, publishData, importData } = useApp();
  const [activeTab, setActiveTab] = useState('schedules');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [publishState, setPublishState] = useState('idle');
  const [publishError, setPublishError] = useState('');

  function handleLogout() { logout(); onClose(); }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(''); setImportSuccess(false);
    try { await importData(file); setImportSuccess(true); setTimeout(() => setImportSuccess(false), 3000); }
    catch (err) { setImportError(err.message); }
    e.target.value = '';
  }

  async function handlePublish() {
    setPublishState('loading'); setPublishError('');
    try { await publishData(); setPublishState('success'); setTimeout(() => setPublishState('idle'), 4000); }
    catch (err) { setPublishState('error'); setPublishError(err.message); setTimeout(() => setPublishState('idle'), 6000); }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden" style={{backgroundColor:'var(--cream)'}}>

      {/* ── Header ── */}
      <div className="flex-shrink-0" style={{backgroundColor:'var(--brown-dark)', borderBottom:'3px solid var(--gold)'}}>
        <div style={{backgroundColor:'var(--gold)', height:3}} />
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{color:'var(--gold)'}} />
            <span style={{fontFamily:"'Cinzel', serif", color:'var(--gold)', fontSize:13, letterSpacing:'0.08em', fontWeight:600}}>
              Painel Administrativo
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Publicar */}
            <button
              onClick={handlePublish}
              disabled={publishState === 'loading'}
              title="Publicar escalas para todos"
              style={{
                ...BTN.base,
                ...(publishState === 'success' ? {backgroundColor:'#4A8C4A', color:'#fff'} :
                    publishState === 'error'   ? {backgroundColor:'#8B2222', color:'#fff'} :
                    BTN.gold),
                opacity: publishState === 'loading' ? 0.7 : 1,
              }}
            >
              {publishState === 'loading' ? <span className="w-3 h-3 border-2 rounded-full animate-spin" style={{borderColor:'var(--brown-dark)', borderTopColor:'transparent'}} />
               : publishState === 'success' ? <span>✓</span>
               : <Globe className="w-3 h-3" />}
              {publishState === 'loading' ? 'Publicando...' : publishState === 'success' ? 'Publicado!' : 'Publicar'}
            </button>

            {/* Backup */}
            <button onClick={exportData} title="Baixar backup" style={{...BTN.base, ...BTN.outline}}>
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Import */}
            <label title="Importar dados" style={{...BTN.base, ...BTN.outline, cursor:'pointer'}}>
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>

            {/* Sair */}
            <button onClick={handleLogout} style={{...BTN.base, ...BTN.danger}}>
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Banners */}
      {publishState === 'error' && publishError && (
        <div className="px-4 py-2 flex items-center justify-between text-sm flex-shrink-0"
          style={{backgroundColor:'#FAE0E0', color:'#8B2222', borderBottom:'1px solid #E8B4B4'}}>
          <span>✗ {publishError}</span>
          <button onClick={() => setPublishState('idle')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {(importError || importSuccess) && (
        <div className="px-4 py-2 text-sm flex-shrink-0"
          style={importSuccess
            ? {backgroundColor:'#E8F5E8', color:'#2E7D2E', borderBottom:'1px solid #A8D8A8'}
            : {backgroundColor:'#FAE0E0', color:'#8B2222', borderBottom:'1px solid #E8B4B4'}}>
          {importSuccess ? '✓ Dados importados com sucesso!' : `✗ ${importError}`}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex flex-shrink-0 overflow-x-auto" style={{backgroundColor:'var(--brown)', borderBottom:'2px solid var(--gold)'}}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 whitespace-nowrap transition-colors"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: '0.06em',
              borderBottom: activeTab === id ? '2px solid var(--gold)' : '2px solid transparent',
              color: activeTab === id ? 'var(--gold)' : 'rgba(245,237,227,0.6)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === id ? '2px solid var(--gold)' : '2px solid transparent',
              cursor: 'pointer',
              minWidth: 64,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'schedules' && <SchedulesPanel />}
        {activeTab === 'ministers' && <MinistersPanel />}
        {activeTab === 'masses' && <MassesPanel />}
        {activeTab === 'notices' && <NoticesPanel />}
        {activeTab === 'pdf' && <AdminExportPDF />}
      </div>
    </div>
  );
}

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

export default function AdminPanel({ onClose }) {
  const { logout, exportData, publishData, importData } = useApp();
  const [activeTab, setActiveTab] = useState('schedules');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [publishState, setPublishState] = useState('idle'); // idle | loading | success | error
  const [publishError, setPublishError] = useState('');

  function handleLogout() {
    logout();
    onClose();
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportSuccess(false);
    try {
      await importData(file);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err) {
      setImportError(err.message);
    }
    e.target.value = '';
  }

  async function handlePublish() {
    setPublishState('loading');
    setPublishError('');
    try {
      await publishData();
      setPublishState('success');
      setTimeout(() => setPublishState('idle'), 4000);
    } catch (err) {
      setPublishState('error');
      setPublishError(err.message);
      setTimeout(() => setPublishState('idle'), 6000);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-700 dark:bg-purple-900 px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-200" />
          <span className="font-bold text-white text-base">Painel Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Publicar */}
          <button
            onClick={handlePublish}
            disabled={publishState === 'loading'}
            title="Publicar escalas para todos"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-70 ${
              publishState === 'success'
                ? 'bg-green-400'
                : publishState === 'error'
                ? 'bg-red-500 hover:bg-red-400'
                : 'bg-green-500 hover:bg-green-400'
            }`}
          >
            {publishState === 'loading' ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : publishState === 'success' ? (
              <span>✓</span>
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            {publishState === 'loading' ? 'Publicando...' : publishState === 'success' ? 'Publicado!' : 'Publicar'}
          </button>
          {/* Export backup */}
          <button
            onClick={exportData}
            title="Baixar backup"
            className="p-2 rounded-lg text-purple-200 hover:text-white hover:bg-purple-600 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          {/* Import */}
          <label title="Importar dados" className="p-2 rounded-lg text-purple-200 hover:text-white hover:bg-purple-600 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/60 hover:bg-purple-600 text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      {/* Banner de erro de publicação */}
      {publishState === 'error' && publishError && (
        <div className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>✗ {publishError}</span>
          <button onClick={() => setPublishState('idle')} className="ml-2 text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Feedback de import */}
      {(importError || importSuccess) && (
        <div className={`px-4 py-2 text-sm ${importSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
          {importSuccess ? '✓ Dados importados com sucesso!' : `✗ ${importError}`}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
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

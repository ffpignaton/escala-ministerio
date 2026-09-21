import { useState } from 'react';
import { LogOut, Users, CalendarDays, Clock, Download, Upload, ShieldCheck, Globe, X, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MinistersPanel from './MinistersPanel';
import SchedulesPanel from './SchedulesPanel';
import MassesPanel from './MassesPanel';

const TABS = [
  { id: 'schedules', label: 'Escalas', icon: CalendarDays },
  { id: 'ministers', label: 'Ministros', icon: Users },
  { id: 'masses', label: 'Missas', icon: Clock },
];

export default function AdminPanel({ onClose }) {
  const { logout, exportData, publishData, importData } = useApp();
  const [activeTab, setActiveTab] = useState('schedules');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [showPublishGuide, setShowPublishGuide] = useState(false);

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

  function handlePublish() {
    publishData();
    setShowPublishGuide(true);
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
            title="Publicar escalas (atualiza para todos)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-white text-xs font-semibold transition-colors"
          >
            <Globe className="w-3.5 h-3.5" /> Publicar
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

      {/* Guia de publicação */}
      {showPublishGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                <h3 className="font-bold text-gray-800 dark:text-gray-100">Publicar escalas</h3>
              </div>
              <button onClick={() => setShowPublishGuide(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              O arquivo <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">data.json</code> foi baixado. Agora siga estes passos para que todos vejam a escala atualizada:
            </p>

            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">1</span>
                <span>Acesse o repositório no GitHub e navegue até a pasta <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs font-mono">public/</code></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">2</span>
                <span>Clique em <strong>data.json</strong> → clique no ícone de lápis ✏️ (editar) → clique em <strong>"Upload file"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">3</span>
                <span>Faça upload do arquivo <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs font-mono">data.json</code> que foi baixado e confirme o commit</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">4</span>
                <span>O Vercel atualiza automaticamente em ~1 minuto e todos verão a escala nova! 🎉</span>
              </li>
            </ol>

            <a
              href="https://github.com/ffpignaton/escala-ministerio/upload/main/public"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium transition-colors"
            >
              Abrir GitHub para fazer upload <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setShowPublishGuide(false)}
              className="mt-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
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
      </div>
    </div>
  );
}

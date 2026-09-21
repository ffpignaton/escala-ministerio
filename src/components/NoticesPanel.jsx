import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Megaphone, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

function NoticeForm({ initial, onSave, onCancel }) {
  const [text, setText] = useState(initial?.text ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({ text: text.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Texto do aviso *</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o aviso..."
          rows={3}
          required
          autoFocus
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center gap-1 transition-colors">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>
    </form>
  );
}

export default function NoticesPanel() {
  const { notices, addNotice, updateNotice, removeNotice } = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <div className="space-y-4">
      <button
        onClick={() => { setAdding(true); setEditingId(null); }}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
      >
        <Plus className="w-4 h-4" /> Novo Aviso
      </button>

      {adding && (
        <NoticeForm
          onSave={(data) => { addNotice(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="space-y-2">
        {notices.length === 0 && !adding && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Nenhum aviso cadastrado</p>
        )}
        {notices.map((notice) => (
          <div key={notice.id}>
            {editingId === notice.id ? (
              <NoticeForm
                initial={notice}
                onSave={(data) => { updateNotice(notice.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl px-4 py-3 border border-amber-100 dark:border-amber-800">
                <Megaphone className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{notice.text}</p>
                <button onClick={() => setEditingId(notice.id)} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setConfirmDelete(notice.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Remover aviso</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Tem certeza que deseja remover este aviso?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { removeNotice(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

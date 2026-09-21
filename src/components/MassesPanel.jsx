import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

function MassForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [time, setTime] = useState(initial?.time ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !time) return;
    onSave({ name: name.trim(), time });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome da missa *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Missa das 9h"
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Horário *</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1 transition-colors">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>
    </form>
  );
}

export default function MassesPanel() {
  const { masses, addMass, updateMass, removeMass } = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <div className="space-y-4">
      <button
        onClick={() => { setAdding(true); setEditingId(null); }}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
      >
        <Plus className="w-4 h-4" /> Nova Missa
      </button>

      {adding && (
        <MassForm
          onSave={(data) => { addMass(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="space-y-2">
        {masses.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Nenhuma missa cadastrada</p>
        )}
        {masses.map((mass) => (
          <div key={mass.id}>
            {editingId === mass.id ? (
              <MassForm
                initial={mass}
                onSave={(data) => { updateMass(mass.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{mass.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{mass.time}</p>
                </div>
                <button onClick={() => setEditingId(mass.id)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDelete(mass.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Remover missa</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Todas as escalas dessa missa serão removidas. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { removeMass(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

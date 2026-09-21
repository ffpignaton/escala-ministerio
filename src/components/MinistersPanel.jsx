import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Phone, User, Cake } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatBirthday(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function MinisterForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [birthday, setBirthday] = useState(initial?.birthday ?? '');
  const [active, setActive] = useState(initial?.active ?? true);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), phone: phone.trim(), birthday, active });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do ministro"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoFocus
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Telefone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-0000"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data de nascimento</label>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded accent-purple-600"
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">Ministro ativo</span>
      </label>
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

export default function MinistersPanel() {
  const { ministers, addMinister, updateMinister, removeMinister } = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = ministers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Busca + botão add */}
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ministro..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>

      {/* Formulário de adição */}
      {adding && (
        <MinisterForm
          onSave={(data) => { addMinister(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {search ? 'Nenhum resultado' : 'Nenhum ministro cadastrado'}
          </p>
        )}
        {filtered.map((minister) => (
          <div key={minister.id}>
            {editingId === minister.id ? (
              <MinisterForm
                initial={minister}
                onSave={(data) => { updateMinister(minister.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{minister.name}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {minister.phone && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {minister.phone}
                      </p>
                    )}
                    {minister.birthday && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Cake className="w-3 h-3" /> {formatBirthday(minister.birthday)}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${minister.active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                  {minister.active ? 'Ativo' : 'Inativo'}
                </span>
                <button
                  onClick={() => setEditingId(minister.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(minister.id)}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Este ministro será removido de todas as escalas. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => { removeMinister(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

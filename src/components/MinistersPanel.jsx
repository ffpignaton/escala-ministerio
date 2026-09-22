import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Phone, User, Cake } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { T } from '../styles/tokens';

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
    <form onSubmit={handleSubmit} style={{ ...T.formCard, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do ministro"
            style={T.input}
            autoFocus
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Telefone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-0000"
            style={T.input}
          />
        </div>
      </div>
      <div>
        <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Data de nascimento</label>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          style={{ ...T.input, width: 'auto' }}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          style={{ accentColor: 'var(--brown)' }}
        />
        <span style={T.body}>Ministro ativo</span>
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={T.btnOutline}>Cancelar</button>
        <button type="submit" style={T.btnPrimary}>
          <Check size={14} /> Salvar
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Busca + botão add */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ministro..."
          style={{ ...T.input, flex: 1 }}
        />
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          style={T.btnPrimary}
        >
          <Plus size={14} /> Novo
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <p style={{ ...T.small, textAlign: 'center', padding: '16px 0' }}>
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
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                backgroundColor: 'var(--brown-light)',
                border: '1px solid var(--border)',
                borderRadius: 12, padding: '10px 14px',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: 'var(--gold-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <User size={16} style={{ color: 'var(--brown-dark)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...T.body, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {minister.name}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>
                    {minister.phone && (
                      <p style={{ ...T.small, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={11} /> {minister.phone}
                      </p>
                    )}
                    {minister.birthday && (
                      <p style={{ ...T.small, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Cake size={11} /> {formatBirthday(minister.birthday)}
                      </p>
                    )}
                  </div>
                </div>
                <span style={{
                  ...T.label,
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 999,
                  backgroundColor: minister.active ? 'var(--gold-light)' : 'var(--border)',
                  color: minister.active ? 'var(--brown-dark)' : 'var(--muted)',
                }}>
                  {minister.active ? 'Ativo' : 'Inativo'}
                </span>
                <button
                  onClick={() => setEditingId(minister.id)}
                  style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                  aria-label="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setConfirmDelete(minister.id)}
                  style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                  aria-label="Remover"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 16 }}>
          <div style={{ backgroundColor: 'var(--cream)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ ...T.heading, fontSize: 15, marginBottom: 8 }}>Confirmar exclusão</h3>
            <p style={{ ...T.small, marginBottom: 16 }}>
              Este ministro será removido de todas as escalas. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...T.btnOutline, flex: 1, justifyContent: 'center' }}>Cancelar</button>
              <button
                onClick={() => { removeMinister(confirmDelete); setConfirmDelete(null); }}
                style={{ ...T.btnDanger, flex: 1, justifyContent: 'center' }}
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

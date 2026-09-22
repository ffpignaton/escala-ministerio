import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { T } from '../styles/tokens';

function MassForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [time, setTime] = useState(initial?.time ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !time) return;
    onSave({ name: name.trim(), time });
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...T.formCard, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Nome da missa *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Missa das 9h"
            required
            style={T.input}
            autoFocus
          />
        </div>
        <div>
          <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Horário *</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            style={{ ...T.input, width: 'auto' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={T.btnOutline}>Cancelar</button>
        <button type="submit" style={T.btnPrimary}>
          <Check size={14} /> Salvar
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button
        onClick={() => { setAdding(true); setEditingId(null); }}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 12,
          border: '2px dashed var(--gold)', background: 'transparent',
          color: 'var(--brown-dark)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.05em',
        }}
      >
        <Plus size={14} /> Nova Missa
      </button>

      {adding && (
        <MassForm
          onSave={(data) => { addMass(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {masses.length === 0 && (
          <p style={{ ...T.small, textAlign: 'center', padding: '16px 0' }}>Nenhuma missa cadastrada</p>
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
                  <Clock size={16} style={{ color: 'var(--brown-dark)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...T.body, fontWeight: 600 }}>{mass.name}</p>
                  <p style={T.small}>{mass.time}</p>
                </div>
                <button
                  onClick={() => setEditingId(mass.id)}
                  style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setConfirmDelete(mass.id)}
                  style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 16 }}>
          <div style={{ backgroundColor: 'var(--cream)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ ...T.heading, fontSize: 15, marginBottom: 8 }}>Remover missa</h3>
            <p style={{ ...T.small, marginBottom: 16 }}>
              Todas as escalas dessa missa serão removidas. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...T.btnOutline, flex: 1, justifyContent: 'center' }}>Cancelar</button>
              <button
                onClick={() => { removeMass(confirmDelete); setConfirmDelete(null); }}
                style={{ ...T.btnDanger, flex: 1, justifyContent: 'center' }}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

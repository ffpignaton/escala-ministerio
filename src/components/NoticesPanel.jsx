import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Megaphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { T } from '../styles/tokens';

function NoticeForm({ initial, onSave, onCancel }) {
  const [text, setText] = useState(initial?.text ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({ text: text.trim() });
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...T.formCard, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Texto do aviso *</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o aviso..."
          rows={3}
          required
          autoFocus
          style={{ ...T.input, resize: 'none' }}
        />
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

export default function NoticesPanel() {
  const { notices, addNotice, updateNotice, removeNotice } = useApp();
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
        <Plus size={14} /> Novo Aviso
      </button>

      {adding && (
        <NoticeForm
          onSave={(data) => { addNotice(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notices.length === 0 && !adding && (
          <p style={{ ...T.small, textAlign: 'center', padding: '16px 0' }}>Nenhum aviso cadastrado</p>
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
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: 'linear-gradient(135deg,#FDF6E3,#F5E6C0)',
                border: '1px solid var(--gold)',
                borderRadius: 12, padding: '10px 14px',
              }}>
                <Megaphone size={15} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
                <p style={{ ...T.body, flex: 1, lineHeight: 1.6 }}>{notice.text}</p>
                <button
                  onClick={() => setEditingId(notice.id)}
                  style={{ padding: 5, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setConfirmDelete(notice.id)}
                  style={{ padding: 5, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 16 }}>
          <div style={{ backgroundColor: 'var(--cream)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ ...T.heading, fontSize: 15, marginBottom: 8 }}>Remover aviso</h3>
            <p style={{ ...T.small, marginBottom: 16 }}>Tem certeza que deseja remover este aviso?</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...T.btnOutline, flex: 1, justifyContent: 'center' }}>Cancelar</button>
              <button
                onClick={() => { removeNotice(confirmDelete); setConfirmDelete(null); }}
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

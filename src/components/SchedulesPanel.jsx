import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Check, Clock, Users, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { T } from '../styles/tokens';

function ScheduleForm({ initial, targetDate, onSave, onCancel }) {
  const { ministers, masses } = useApp();
  const [date, setDate] = useState(initial?.date ?? targetDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [massId, setMassId] = useState(initial?.massId ?? masses[0]?.id ?? '');
  const [selectedMinisters, setSelectedMinisters] = useState(initial?.ministerIds ?? []);

  const activeMinsters = ministers.filter((m) => m.active);

  function toggleMinister(id) {
    setSelectedMinisters((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!date || !massId) return;
    onSave({ ...(initial ?? {}), date, massId, ministerIds: selectedMinisters });
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...T.formCard, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Data *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={T.input}
          />
        </div>
        <div>
          <label style={{ ...T.label, display: 'block', marginBottom: 4 }}>Missa *</label>
          <select
            value={massId}
            onChange={(e) => setMassId(e.target.value)}
            required
            style={T.input}
          >
            {masses.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={{ ...T.label, display: 'block', marginBottom: 8 }}>Ministros escalados</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, maxHeight: 192, overflowY: 'auto' }}>
          {activeMinsters.map((m) => (
            <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}>
              <input
                type="checkbox"
                checked={selectedMinisters.includes(m.id)}
                onChange={() => toggleMinister(m.id)}
                style={{ accentColor: 'var(--brown)' }}
              />
              <span style={{ ...T.body, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
            </label>
          ))}
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

export default function SchedulesPanel() {
  const { schedules, masses, ministers, upsertSchedule, removeSchedule } = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getMass = (id) => masses.find((m) => m.id === id);
  const getMinister = (id) => ministers.find((m) => m.id === id);

  const grouped = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    const filtered = schedules.filter((s) => s.date.startsWith(monthStr));
    const map = {};
    filtered.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scheds]) => ({
        date,
        schedules: scheds.sort((a, b) => {
          const ma = getMass(a.massId);
          const mb = getMass(b.massId);
          return (ma?.time || '').localeCompare(mb?.time || '');
        }),
      }));
  }, [schedules, currentMonth, masses]);

  function formatDateLabel(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Navegação de mês */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
        >
          <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
        </button>
        <span style={{ ...T.heading, fontSize: 14, textTransform: 'capitalize' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
        >
          <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>

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
        <Plus size={14} /> Nova Escala
      </button>

      {adding && (
        <ScheduleForm
          onSave={(data) => { upsertSchedule(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {grouped.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
          <CalendarDays size={40} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p style={T.small}>Nenhuma escala neste mês</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {grouped.map(({ date, schedules: dayScheds }) => {
          const isExpanded = expandedDate === date;
          return (
            <div key={date} style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedDate(isExpanded ? null : date)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', backgroundColor: 'var(--brown-light)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarDays size={15} style={{ color: 'var(--brown)' }} />
                  <span style={{ ...T.body, fontWeight: 600, textTransform: 'capitalize', fontSize: 13 }}>
                    {formatDateLabel(date)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={T.small}>{dayScheds.length} missa(s)</span>
                  {isExpanded
                    ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} />
                    : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />}
                </div>
              </button>

              {isExpanded && (
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayScheds.map((schedule) => {
                    const mass = getMass(schedule.massId);
                    return (
                      <div key={schedule.id}>
                        {editingId === schedule.id ? (
                          <ScheduleForm
                            initial={schedule}
                            onSave={(data) => { upsertSchedule({ ...data, id: schedule.id }); setEditingId(null); }}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            backgroundColor: 'var(--cream)',
                            borderRadius: 10, padding: '8px 12px',
                            border: '1px solid var(--border)',
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <Clock size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                                <span style={{ ...T.body, fontWeight: 600, fontSize: 13 }}>{mass?.name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <Users size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                                {schedule.ministerIds.length === 0 ? (
                                  <span style={{ ...T.small, color: '#c0392b' }}>Sem ministros</span>
                                ) : (
                                  schedule.ministerIds.map((mid) => {
                                    const min = getMinister(mid);
                                    return min ? (
                                      <span key={mid} style={{
                                        ...T.small, fontSize: 11,
                                        backgroundColor: 'var(--gold-light)',
                                        color: 'var(--brown-dark)',
                                        padding: '1px 8px', borderRadius: 999,
                                      }}>
                                        {min.name}
                                      </span>
                                    ) : null;
                                  })
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button
                                onClick={() => setEditingId(schedule.id)}
                                style={{ padding: 5, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(schedule.id)}
                                style={{ padding: 5, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 16 }}>
          <div style={{ backgroundColor: 'var(--cream)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ ...T.heading, fontSize: 15, marginBottom: 8 }}>Remover escala</h3>
            <p style={{ ...T.small, marginBottom: 16 }}>Tem certeza que deseja remover esta escala?</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...T.btnOutline, flex: 1, justifyContent: 'center' }}>Cancelar</button>
              <button
                onClick={() => { removeSchedule(confirmDelete); setConfirmDelete(null); }}
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

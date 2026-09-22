import { useMemo } from 'react';
import { X, Clock, CalendarDays, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { T } from '../styles/tokens';

export default function MinisterScheduleModal({ minister, onClose }) {
  const { schedules, masses } = useApp();

  const getMass = (id) => masses.find((m) => m.id === id);

  const mySchedules = useMemo(() => {
    return schedules
      .filter((s) => s.ministerIds.includes(minister.id))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (getMass(a.massId)?.time || '').localeCompare(getMass(b.massId)?.time || '');
      });
  }, [schedules, minister.id, masses]);

  const grouped = useMemo(() => {
    const map = {};
    mySchedules.forEach((s) => {
      const monthKey = s.date.slice(0, 7);
      if (!map[monthKey]) map[monthKey] = [];
      map[monthKey].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [mySchedules]);

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return format(new Date(y, m - 1, d), "EEE, dd/MM", { locale: ptBR });
  }

  function formatMonthLabel(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    return format(new Date(y, m - 1, 1), "MMMM 'de' yyyy", { locale: ptBR });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      className="sm:items-center sm:p-4">
      <div style={{ backgroundColor: 'var(--cream)', borderRadius: '24px 24px 0 0', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', width: '100%', maxWidth: 480, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        className="sm:rounded-2xl">

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              backgroundColor: 'var(--gold-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <User size={18} style={{ color: 'var(--brown-dark)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: 'var(--brown-dark)' }}>
                {minister.name}
              </h2>
              <p style={T.small}>
                {mySchedules.length === 0
                  ? 'Nenhuma escala encontrada'
                  : `${mySchedules.length} escala${mySchedules.length !== 1 ? 's' : ''} no total`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: '50%', border: 'none', background: 'var(--brown-light)', cursor: 'pointer', color: 'var(--muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
          {mySchedules.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0', color: 'var(--muted)' }}>
              <CalendarDays size={40} style={{ opacity: 0.35 }} />
              <p style={T.small}>Nenhuma escala cadastrada para este ministro</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {grouped.map(([monthKey, items]) => (
                <div key={monthKey}>
                  {/* Cabeçalho do mês */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CalendarDays size={13} style={{ color: 'var(--brown)' }} />
                    <span style={{ ...T.label, textTransform: 'capitalize', color: 'var(--brown)' }}>
                      {formatMonthLabel(monthKey)}
                    </span>
                    <span style={T.small}>· {items.length} escala{items.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map((s) => {
                      const mass = getMass(s.massId);
                      return (
                        <div
                          key={s.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'var(--brown-light)', borderRadius: 12, padding: '8px 14px', border: '1px solid var(--border)' }}
                        >
                          <span style={T.dot} />
                          <span style={{ ...T.body, fontWeight: 500, textTransform: 'capitalize', flex: 1 }}>
                            {formatDate(s.date)}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 999, backgroundColor: 'var(--gold-light)', color: 'var(--brown-dark)', fontFamily: "'EB Garamond', serif" }}>
                            <Clock size={11} />
                            {mass?.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ ...T.btnPrimary, width: '100%', justifyContent: 'center', padding: '10px 0', fontSize: 12 }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

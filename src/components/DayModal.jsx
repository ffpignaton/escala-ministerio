import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Clock, Users, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { T } from '../styles/tokens';

export default function DayModal({ day, daySchedules, onClose }) {
  const { ministers, masses } = useApp();

  const getMinister = (id) => ministers.find((m) => m.id === id);
  const getMass = (id) => masses.find((m) => m.id === id);

  const sortedSchedules = [...daySchedules].sort((a, b) => {
    return (getMass(a.massId)?.time || '').localeCompare(getMass(b.massId)?.time || '');
  });

  const isSunday = day.getDay() === 0;
  const dateLabel = format(day, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      className="sm:items-center sm:p-4">
      <div style={{ backgroundColor: 'var(--cream)', borderRadius: '24px 24px 0 0', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', width: '100%', maxWidth: 480, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        className="sm:rounded-2xl">

        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, backgroundColor: 'var(--brown-dark)', borderRadius: '24px 24px 0 0' }}
          className="sm:rounded-t-2xl">
          <div>
            <p style={{ ...T.label, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>
              {isSunday ? '✦ Domingo' : format(day, 'EEEE', { locale: ptBR })}
            </p>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: 'var(--gold)', textTransform: 'capitalize', lineHeight: 1.3, marginTop: 2 }}>
              {dateLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 16 }}>
          {sortedSchedules.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0', color: 'var(--muted)' }}>
              <AlertCircle size={40} style={{ opacity: 0.35 }} />
              <p style={T.small}>Nenhuma escala para este dia</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedSchedules.map((schedule) => {
                const mass = getMass(schedule.massId);
                const ministersInSchedule = schedule.ministerIds.map(getMinister).filter(Boolean);

                return (
                  <div key={schedule.id} style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {/* Cabeçalho da missa */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', backgroundColor: 'var(--brown-light)', borderBottom: '1px solid var(--border)' }}>
                      <Clock size={15} style={{ color: 'var(--brown)', flexShrink: 0 }} />
                      <span style={{ ...T.body, fontWeight: 600, flex: 1, fontSize: 14 }}>
                        {mass?.name || 'Missa'}
                      </span>
                      <span style={{ ...T.small, fontSize: 11, backgroundColor: 'var(--gold-light)', color: 'var(--brown-dark)', padding: '2px 8px', borderRadius: 999 }}>
                        {mass?.time}
                      </span>
                    </div>

                    {/* Lista de ministros */}
                    <div style={{ padding: '10px 14px' }}>
                      {ministersInSchedule.length === 0 ? (
                        <p style={{ ...T.small, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <AlertCircle size={13} /> Sem ministros escalados
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <Users size={13} style={{ color: 'var(--muted)' }} />
                            <span style={T.small}>
                              {ministersInSchedule.length} ministro{ministersInSchedule.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {ministersInSchedule.map((minister) => (
                            <div
                              key={minister.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, padding: '5px 10px', backgroundColor: 'var(--brown-light)' }}
                            >
                              <span style={T.dot} />
                              <span style={T.body}>{minister.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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

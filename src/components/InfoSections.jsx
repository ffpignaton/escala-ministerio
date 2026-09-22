import { useMemo } from 'react';
import { Megaphone, Cake } from 'lucide-react';
import { useApp } from '../context/AppContext';

function getMonthDay(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  return { month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) };
}

export function NoticesSection() {
  const { notices } = useApp();
  if (!notices || notices.length === 0) return null;

  return (
    <div style={{
      marginBottom: 16,
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--cream)',
      boxShadow: '0 2px 12px rgba(91,53,24,0.07)',
    }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        backgroundColor: 'var(--brown-dark)',
        borderBottom: '2px solid var(--gold)',
      }}>
        <Megaphone size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--gold)',
          textTransform: 'uppercase',
        }}>
          Avisos
        </span>
      </div>

      {/* Lista */}
      <ul style={{ margin: 0, padding: '10px 16px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notices.map((n) => (
          <li key={n.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            paddingLeft: 10,
            borderLeft: '3px solid var(--gold)',
          }}>
            <span style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: 15,
              color: 'var(--text)',
              lineHeight: 1.55,
            }}>
              {n.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BirthdaysSection({ currentMonth }) {
  const { ministers } = useApp();

  const birthdays = useMemo(() => {
    const month = currentMonth.getMonth() + 1;
    return ministers
      .filter((m) => m.active && m.birthday)
      .map((m) => ({ ...m, md: getMonthDay(m.birthday) }))
      .filter((m) => m.md && m.md.month === month)
      .sort((a, b) => a.md.day - b.md.day);
  }, [ministers, currentMonth]);

  if (birthdays.length === 0) return null;

  return (
    <div style={{
      marginBottom: 16,
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--cream)',
      boxShadow: '0 2px 12px rgba(91,53,24,0.07)',
    }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        backgroundColor: 'var(--brown-dark)',
        borderBottom: '2px solid var(--gold)',
      }}>
        <Cake size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--gold)',
          textTransform: 'uppercase',
        }}>
          Aniversariantes do mês
        </span>
      </div>

      {/* Chips */}
      <div style={{ padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {birthdays.map((m) => (
          <div key={m.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            borderRadius: 999,
            padding: '5px 12px',
            backgroundColor: 'var(--brown-light)',
            border: '1px solid var(--border)',
          }}>
            <Cake size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <span style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text)',
            }}>
              {m.name}
            </span>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              color: 'var(--muted)',
              letterSpacing: '0.04em',
            }}>
              dia {m.md.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

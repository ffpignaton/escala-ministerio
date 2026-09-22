import { useMemo } from 'react';
import { Megaphone, Cake } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CARD_STYLE = {
  background: 'linear-gradient(135deg,#FDF6E3,#F5E6C0)',
  border: '1px solid var(--gold)',
};
const TITLE_STYLE = {
  fontFamily: "'Cinzel', serif",
  fontSize: 13,
  color: 'var(--brown-dark)',
  letterSpacing: '0.06em',
  fontWeight: 600,
};
const TEXT_STYLE = {
  fontFamily: "'EB Garamond', serif",
  fontSize: 15,
  color: 'var(--text)',
};

function getMonthDay(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  return { month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) };
}

export function NoticesSection() {
  const { notices } = useApp();
  if (!notices || notices.length === 0) return null;

  return (
    <div className="rounded-2xl p-4 mb-4" style={CARD_STYLE}>
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 flex-shrink-0" style={{color:'var(--brown)'}} />
        <h3 style={TITLE_STYLE}>Avisos</h3>
      </div>
      <ul className="space-y-2">
        {notices.map((n) => (
          <li key={n.id} className="flex items-start gap-2" style={TEXT_STYLE}>
            <span style={{color:'var(--gold)', marginTop:2, flexShrink:0}}>✦</span>
            <span className="leading-relaxed">{n.text}</span>
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
    <div className="rounded-2xl p-4 mb-4" style={CARD_STYLE}>
      <div className="flex items-center gap-2 mb-3">
        <Cake className="w-4 h-4 flex-shrink-0" style={{color:'var(--brown)'}} />
        <h3 style={TITLE_STYLE}>Aniversariantes do mês</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {birthdays.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{backgroundColor:'rgba(255,255,255,0.6)', border:'1px solid var(--gold)'}}>
            <span className="text-base">🎂</span>
            <span style={{...TEXT_STYLE, fontWeight:600}}>{m.name}</span>
            <span style={{fontFamily:"'EB Garamond', serif", fontSize:12, color:'var(--muted)'}}>dia {m.md.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl p-4 mb-4" style={{background:'linear-gradient(135deg,#FDF6E3,#F5E6C0)', border:'1px solid var(--gold)'}}>
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 flex-shrink-0" style={{color:'var(--brown)'}} />
        <h3 style={{fontFamily:"'Cinzel', serif", fontSize:13, color:'var(--brown-dark)', letterSpacing:'0.06em', fontWeight:600}}>Avisos</h3>
      </div>
      <ul className="space-y-2">
        {notices.map((n) => (
          <li key={n.id} className="flex items-start gap-2" style={{fontFamily:"'EB Garamond', serif", fontSize:15, color:'var(--text)'}}>
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
    <div className="rounded-2xl p-4 mb-4" style={{background:'linear-gradient(135deg,#FDF0F0,#FAE0E0)', border:'1px solid #E8B4B4'}}>
      <div className="flex items-center gap-2 mb-3">
        <Cake className="w-4 h-4 flex-shrink-0" style={{color:'#9B4444'}} />
        <h3 style={{fontFamily:"'Cinzel', serif", fontSize:13, color:'#6B2222', letterSpacing:'0.06em', fontWeight:600}}>Aniversariantes do mês</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {birthdays.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{backgroundColor:'rgba(255,255,255,0.7)', border:'1px solid #E8B4B4'}}>
            <span className="text-base">🎂</span>
            <span style={{fontFamily:"'EB Garamond', serif", fontSize:14, color:'#6B2222', fontWeight:600}}>{m.name}</span>
            <span style={{fontSize:12, color:'#C47070'}}>dia {m.md.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

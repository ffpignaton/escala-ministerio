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
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Megaphone className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-amber-800">Avisos</h3>
      </div>
      <ul className="space-y-2">
        {notices.map((n) => (
          <li key={n.id} className="flex items-start gap-2 text-sm text-amber-900">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
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
    <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Cake className="w-4 h-4 text-pink-500 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-pink-700">Aniversariantes do mês</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {birthdays.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5 bg-white border border-pink-200 rounded-full px-3 py-1">
            <span className="text-base">🎂</span>
            <span className="text-xs font-medium text-pink-800">{m.name}</span>
            <span className="text-xs text-pink-400">dia {m.md.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

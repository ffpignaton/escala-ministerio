import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import DayModal from './DayModal';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Calendar({ filterMinisterId, filterMassId, currentMonth, setCurrentMonth }) {
  const { schedules, masses, ministers } = useApp();
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  // Indexa escalas por data para acesso rápido
  const schedulesByDate = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      let filtered = s;
      if (filterMassId && s.massId !== filterMassId) return;
      if (filterMinisterId && !s.ministerIds.includes(filterMinisterId)) return;
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(filtered);
    });
    return map;
  }, [schedules, filterMassId, filterMinisterId]);

  const days = useMemo(() => {
    const result = [];
    let d = calStart;
    while (d <= calEnd) {
      result.push(d);
      d = addDays(d, 1);
    }
    return result;
  }, [calStart, calEnd]);

  return (
    <div className="w-full" style={{backgroundColor:'var(--cream)'}}>
      {/* Header do mês */}
      <div className="flex items-center justify-between px-4 py-4" style={{borderBottom:'1px solid var(--border)'}}>
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{color:'var(--brown)', backgroundColor:'var(--brown-light)'}}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <CalIcon className="w-4 h-4" style={{color:'var(--gold)'}} />
          <h2 className="capitalize" style={{fontFamily:"'Cinzel', serif", fontSize:15, color:'var(--brown-dark)', fontWeight:600, letterSpacing:'0.04em'}}>
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>

        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{color:'var(--brown)', backgroundColor:'var(--brown-light)'}}
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-1 px-2 pt-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center py-1" style={{fontSize:11, fontWeight:600, color:'var(--muted)', fontFamily:"'Cinzel', serif", letterSpacing:'0.06em'}}>
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const daySchedules = schedulesByDate[dateStr] || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const isSunday = day.getDay() === 0;
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const hasMass = daySchedules.length > 0;

          return (
            <button
              key={dateStr}
              onClick={() => { if (inMonth) setSelectedDay(isSameDay(day, selectedDay) ? null : day); }}
              disabled={!inMonth}
              className="relative flex flex-col items-center justify-start min-h-[58px] rounded-xl p-1 transition-all"
              style={{
                opacity: inMonth ? 1 : 0.2,
                cursor: inMonth ? 'pointer' : 'default',
                backgroundColor: isSelected ? 'var(--gold-light)' : today ? 'var(--brown-light)' : hasMass && inMonth ? '#FEF9F0' : 'transparent',
                border: isSelected ? '1.5px solid var(--gold)' : today ? '1.5px solid var(--brown)' : '1.5px solid transparent',
              }}
              aria-label={`${format(day, 'd MMMM', { locale: ptBR })}${hasMass ? `, ${daySchedules.length} missa(s)` : ''}`}
            >
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: today ? 'var(--brown-dark)' : 'transparent',
                  color: today ? '#FFF8EC' : isSunday ? 'var(--brown)' : 'var(--text)',
                  fontWeight: today || isSunday ? 700 : 400,
                  fontFamily: isSunday ? "'Cinzel', serif" : "'EB Garamond', serif",
                  fontSize: 15,
                  border: today ? '1.5px solid var(--gold)' : 'none',
                }}
              >
                {format(day, 'd')}
              </span>

              {/* Ponto dourado se tiver missa */}
              {hasMass && inMonth && (
                <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{backgroundColor:'var(--gold)'}} />
              )}
            </button>
          );
        })}
      </div>

      {/* Modal do dia */}
      {selectedDay && (
        <DayModal
          day={selectedDay}
          daySchedules={schedulesByDate[format(selectedDay, 'yyyy-MM-dd')] || []}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

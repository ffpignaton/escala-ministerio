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

  function getDayStatus(dateStr, daySchedules) {
    if (!daySchedules || daySchedules.length === 0) return 'empty';
    const totalMinisters = new Set(daySchedules.flatMap((s) => s.ministerIds)).size;
    if (totalMinisters === 0) return 'empty';
    if (totalMinisters < 3) return 'low';
    if (totalMinisters < 5) return 'medium';
    return 'good';
  }

  const statusColor = {
    empty: '',
    low: 'bg-red-100 dark:bg-red-900/30',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30',
    good: 'bg-green-100 dark:bg-green-900/30',
  };

  const statusDot = {
    empty: '',
    low: 'bg-red-400',
    medium: 'bg-yellow-400',
    good: 'bg-green-400',
  };

  return (
    <div className="w-full">
      {/* Header do mês */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex items-center gap-2">
          <CalIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>

        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Escala completa</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Poucos ministros</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Atenção</span>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const daySchedules = schedulesByDate[dateStr] || [];
          const status = getDayStatus(dateStr, daySchedules);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const isSunday = day.getDay() === 0;
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          return (
            <button
              key={dateStr}
              onClick={() => {
                if (inMonth) setSelectedDay(isSameDay(day, selectedDay) ? null : day);
              }}
              className={[
                'relative flex flex-col items-center justify-start min-h-[56px] rounded-xl p-1 pt-1 transition-all text-sm font-medium border-2',
                inMonth ? 'cursor-pointer' : 'opacity-25 cursor-default pointer-events-none',
                isSelected ? 'border-purple-500 ring-2 ring-purple-300 dark:ring-purple-700' : 'border-transparent',
                today ? 'ring-2 ring-offset-1 ring-purple-400 dark:ring-purple-500' : '',
                inMonth && status !== 'empty' ? statusColor[status] : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                isSunday && inMonth ? 'font-bold' : '',
              ].join(' ')}
              aria-label={`${format(day, 'd MMMM', { locale: ptBR })}${daySchedules.length > 0 ? `, ${daySchedules.length} missa(s)` : ''}`}
            >
              <span className={[
                'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                today ? 'bg-purple-600 text-white font-bold' : '',
                isSunday && !today ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-200',
              ].join(' ')}>
                {format(day, 'd')}
              </span>

              {/* Dots das missas */}
              {daySchedules.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {daySchedules.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      className={`w-1.5 h-1.5 rounded-full ${statusDot[status]}`}
                    />
                  ))}
                  {daySchedules.length > 3 && (
                    <span className="text-xs text-gray-400 leading-none">+</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal/painel expandido do dia */}
      {selectedDay && (
        <DayModal
          day={selectedDay}
          daySchedules={schedulesByDate[format(selectedDay, 'yyyy-MM-dd')] || []}
          onClose={() => setSelectedDay(null)}
          filterMassId={filterMassId}
          filterMinisterId={filterMinisterId}
        />
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { X, Clock, CalendarDays, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '../context/AppContext';

export default function MinisterScheduleModal({ minister, onClose }) {
  const { schedules, masses } = useApp();

  const getMass = (id) => masses.find((m) => m.id === id);

  // Todas as escalas deste ministro, ordenadas por data
  const mySchedules = useMemo(() => {
    return schedules
      .filter((s) => s.ministerIds.includes(minister.id))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (getMass(a.massId)?.time || '').localeCompare(getMass(b.massId)?.time || '');
      });
  }, [schedules, minister.id, masses]);

  // Agrupa por mês
  const grouped = useMemo(() => {
    const map = {};
    mySchedules.forEach((s) => {
      const monthKey = s.date.slice(0, 7); // yyyy-MM
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor:'#f5ede3'}}>
              <User className="w-5 h-5" style={{color:'#8B6340'}} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base leading-tight">{minister.name}</h2>
              <p className="text-xs text-gray-400">
                {mySchedules.length === 0
                  ? 'Nenhuma escala encontrada'
                  : `${mySchedules.length} escala${mySchedules.length !== 1 ? 's' : ''} no total`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1 p-4">
          {mySchedules.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
              <CalendarDays className="w-10 h-10 opacity-40" />
              <p className="text-sm">Nenhuma escala cadastrada para este ministro</p>
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map(([monthKey, items]) => (
                <div key={monthKey}>
                  {/* Cabeçalho do mês */}
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-3.5 h-3.5" style={{color:'#8B6340'}} />
                    <span className="text-xs font-semibold uppercase tracking-wide capitalize" style={{color:'#8B6340'}}>
                      {formatMonthLabel(monthKey)}
                    </span>
                    <span className="text-xs text-gray-400">· {items.length} escala{items.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="space-y-1.5">
                    {items.map((s) => {
                      const mass = getMass(s.massId);
                      return (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium capitalize flex-1">
                            {formatDate(s.date)}
                          </span>
                          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{color:'#8B6340', backgroundColor:'#f5ede3'}}>
                            <Clock className="w-3 h-3" />
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
        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
            style={{backgroundColor:'#8B6340'}}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

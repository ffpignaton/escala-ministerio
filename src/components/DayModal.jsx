import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Clock, Users, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DayModal({ day, daySchedules, onClose, filterMinisterId }) {
  const { ministers, masses } = useApp();

  const getMinister = (id) => ministers.find((m) => m.id === id);
  const getMass = (id) => masses.find((m) => m.id === id);

  const sortedSchedules = [...daySchedules].sort((a, b) => {
    const ma = getMass(a.massId);
    const mb = getMass(b.massId);
    return (ma?.time || '').localeCompare(mb?.time || '');
  });

  const isSunday = day.getDay() === 0;
  const dateLabel = format(day, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between ${isSunday ? 'bg-purple-600' : 'bg-gray-800 dark:bg-gray-900'}`}>
          <div>
            <p className="text-white/80 text-xs uppercase tracking-wide font-medium capitalize">
              {isSunday ? '🌟 Domingo' : format(day, 'EEEE', { locale: ptBR })}
            </p>
            <h3 className="text-white font-bold text-lg capitalize">{dateLabel}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-4">
          {sortedSchedules.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-gray-400 dark:text-gray-500">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">Nenhuma escala para este dia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSchedules.map((schedule) => {
                const mass = getMass(schedule.massId);
                const ministersInSchedule = schedule.ministerIds
                  .map(getMinister)
                  .filter(Boolean)
                  .filter((m) => !filterMinisterId || m.id === filterMinisterId);

                if (filterMinisterId && ministersInSchedule.length === 0) return null;

                return (
                  <div key={schedule.id} className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Cabeçalho da missa */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {mass?.name || 'Missa'}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                        {mass?.time}
                      </span>
                    </div>

                    {/* Lista de ministros */}
                    <div className="px-4 py-3">
                      {ministersInSchedule.length === 0 ? (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Sem ministros escalados
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {ministersInSchedule.length} ministro{ministersInSchedule.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {ministersInSchedule.map((minister) => (
                            <div
                              key={minister.id}
                              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                                filterMinisterId === minister.id
                                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium'
                                  : 'bg-gray-50 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                              {minister.name}
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
      </div>
    </div>
  );
}

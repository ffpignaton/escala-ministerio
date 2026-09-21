import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Clock, Users, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl" style={{backgroundColor:'#8B6340'}}>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-wide font-medium capitalize">
              {isSunday ? '🌟 Domingo' : format(day, 'EEEE', { locale: ptBR })}
            </p>
            <h3 className="text-white font-bold text-lg capitalize leading-tight">{dateLabel}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="overflow-y-auto flex-1 p-4">
          {sortedSchedules.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
              <AlertCircle className="w-10 h-10 opacity-40" />
              <p className="text-sm">Nenhuma escala para este dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSchedules.map((schedule) => {
                const mass = getMass(schedule.massId);
                const ministersInSchedule = schedule.ministerIds
                  .map(getMinister)
                  .filter(Boolean);

                return (
                  <div key={schedule.id} className="rounded-xl border border-gray-100 overflow-hidden">
                    {/* Cabeçalho da missa */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      <Clock className="w-4 h-4 flex-shrink-0" style={{color:'#8B6340'}} />
                      <span className="font-semibold text-gray-800 text-sm flex-1">
                        {mass?.name || 'Missa'}
                      </span>
                      <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
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
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 mb-2">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {ministersInSchedule.length} ministro{ministersInSchedule.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {ministersInSchedule.map((minister) => (
                            <div
                              key={minister.id}
                              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-700"
                            >
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:'#8B6340'}} />
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

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Check, X, Clock, Users, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useApp } from '../context/AppContext';

function ScheduleForm({ initial, targetDate, onSave, onCancel }) {
  const { ministers, masses } = useApp();
  const [date, setDate] = useState(initial?.date ?? targetDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [massId, setMassId] = useState(initial?.massId ?? masses[0]?.id ?? '');
  const [selectedMinisters, setSelectedMinisters] = useState(initial?.ministerIds ?? []);

  const activeMinsters = ministers.filter((m) => m.active);

  function toggleMinister(id) {
    setSelectedMinisters((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!date || !massId) return;
    onSave({
      ...(initial ?? {}),
      date,
      massId,
      ministerIds: selectedMinisters,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Missa *</label>
          <select
            value={massId}
            onChange={(e) => setMassId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {masses.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Ministros escalados</label>
        <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
          {activeMinsters.map((m) => (
            <label key={m.id} className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-white dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={selectedMinisters.includes(m.id)}
                onChange={() => toggleMinister(m.id)}
                className="rounded accent-purple-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{m.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1 transition-colors">
          <Check className="w-4 h-4" /> Salvar
        </button>
      </div>
    </form>
  );
}

export default function SchedulesPanel() {
  const { schedules, masses, ministers, upsertSchedule, removeSchedule } = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const getMass = (id) => masses.find((m) => m.id === id);
  const getMinister = (id) => ministers.find((m) => m.id === id);

  // Escalas agrupadas por data, dentro do mês visualizado
  const grouped = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    const filtered = schedules.filter((s) => s.date.startsWith(monthStr));
    const map = {};
    filtered.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scheds]) => ({
        date,
        schedules: scheds.sort((a, b) => {
          const ma = getMass(a.massId);
          const mb = getMass(b.massId);
          return (ma?.time || '').localeCompare(mb?.time || '');
        }),
      }));
  }, [schedules, currentMonth, masses]);

  function formatDateLabel(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  }

  return (
    <div className="space-y-4">
      {/* Navegação de mês */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronDown className="w-4 h-4 text-gray-500 rotate-90" />
        </button>
        <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
        </button>
      </div>

      <button
        onClick={() => { setAdding(true); setEditingId(null); }}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
      >
        <Plus className="w-4 h-4" /> Nova Escala
      </button>

      {adding && (
        <ScheduleForm
          onSave={(data) => { upsertSchedule(data); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {grouped.length === 0 && !adding && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma escala neste mês</p>
        </div>
      )}

      <div className="space-y-2">
        {grouped.map(({ date, schedules: dayScheds }) => {
          const isExpanded = expandedDate === date;
          return (
            <div key={date} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setExpandedDate(isExpanded ? null : date)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                    {formatDateLabel(date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{dayScheds.length} missa(s)</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 space-y-2">
                  {dayScheds.map((schedule) => {
                    const mass = getMass(schedule.massId);
                    return (
                      <div key={schedule.id}>
                        {editingId === schedule.id ? (
                          <ScheduleForm
                            initial={schedule}
                            onSave={(data) => { upsertSchedule({ ...data, id: schedule.id }); setEditingId(null); }}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <div className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-lg px-3 py-2.5 border border-gray-100 dark:border-gray-700">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{mass?.name}</span>
                              </div>
                              <div className="flex items-center gap-1 flex-wrap">
                                <Users className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                {schedule.ministerIds.length === 0 ? (
                                  <span className="text-xs text-red-400">Sem ministros</span>
                                ) : (
                                  schedule.ministerIds.map((mid) => {
                                    const min = getMinister(mid);
                                    return min ? (
                                      <span key={mid} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                        {min.name}
                                      </span>
                                    ) : null;
                                  })
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => setEditingId(schedule.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setConfirmDelete(schedule.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Remover escala</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Tem certeza que deseja remover esta escala?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { removeSchedule(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

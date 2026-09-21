import { useRef, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useApp } from '../context/AppContext';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ExportPDF({ currentMonth }) {
  const { schedules, ministers, masses } = useApp();
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  // Monta lista de dias
  const days = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(new Date(d));
    d = addDays(d, 1);
  }

  // Indexa escalas por data
  const schedulesByDate = {};
  schedules.forEach((s) => {
    if (!schedulesByDate[s.date]) schedulesByDate[s.date] = [];
    schedulesByDate[s.date].push(s);
  });

  const getMass = (id) => masses.find((m) => m.id === id);
  const getMinister = (id) => ministers.find((m) => m.id === id);

  async function handleExport() {
    setLoading(true);
    try {
      const el = ref.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 16;
      const imgH = (canvas.height * imgW) / canvas.width;

      // Se maior que a página, adiciona páginas
      let y = 8;
      let remaining = imgH;
      let srcY = 0;
      while (remaining > 0) {
        const sliceH = Math.min(remaining, pageH - 16);
        const srcSlice = (sliceH / imgH) * canvas.height;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcSlice;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcSlice, 0, 0, canvas.width, srcSlice);
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 8, y, imgW, sliceH);
        remaining -= sliceH;
        srcY += srcSlice;
        if (remaining > 0) { pdf.addPage(); y = 8; }
      }

      const monthLabel = format(currentMonth, 'MMMM-yyyy', { locale: ptBR });
      pdf.save(`escala-${monthLabel}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  const monthLabel = format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <>
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
        ) : (
          <span className="text-sm">📄</span>
        )}
        {loading ? 'Gerando...' : 'PDF'}
      </button>

      {/* Template oculto para captura */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div ref={ref} style={{ width: 794, backgroundColor: '#fff', padding: '24px', fontFamily: 'sans-serif' }}>
          {/* Cabeçalho */}
          <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '2px solid #8B6340', paddingBottom: 12 }}>
            <p style={{ color: '#8B6340', fontWeight: 700, fontSize: 13, margin: 0 }}>
              Paróquia Santíssima Trindade - Matriz São Jorge
            </p>
            <p style={{ color: '#8B6340', fontWeight: 600, fontSize: 11, margin: '2px 0 0' }}>
              Ministros Extraordinários da Distribuição da Sagrada Comunhão
            </p>
            <p style={{ color: '#555', fontSize: 13, fontWeight: 600, margin: '6px 0 0', textTransform: 'capitalize' }}>
              Escala — {monthLabel}
            </p>
          </div>

          {/* Dias da semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#888', padding: '4px 0' }}>
                {w}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const isSunday = day.getDay() === 0;
              const dayScheds = (schedulesByDate[dateStr] || []).sort((a, b) => {
                return (getMass(a.massId)?.time || '').localeCompare(getMass(b.massId)?.time || '');
              });

              return (
                <div
                  key={dateStr}
                  style={{
                    border: today ? '2px solid #8B6340' : '1px solid #e5e7eb',
                    borderRadius: 6,
                    padding: '4px 5px',
                    minHeight: 72,
                    backgroundColor: inMonth ? (isSunday ? '#fdf8f5' : '#fff') : '#f9fafb',
                    opacity: inMonth ? 1 : 0.3,
                  }}
                >
                  <div style={{
                    fontWeight: 700,
                    fontSize: 11,
                    color: isSunday ? '#8B6340' : today ? '#8B6340' : '#374151',
                    marginBottom: 3,
                  }}>
                    {format(day, 'd')}
                  </div>
                  {dayScheds.map((s) => {
                    const mass = getMass(s.massId);
                    const mins = s.ministerIds.map(getMinister).filter(Boolean);
                    return (
                      <div key={s.id} style={{ marginBottom: 3 }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: '#8B6340' }}>
                          {mass?.time}
                        </div>
                        {mins.map((m) => (
                          <div key={m.id} style={{ fontSize: 8, color: '#374151', lineHeight: 1.3 }}>
                            • {m.name}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Rodapé */}
          <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 8, textAlign: 'center', fontSize: 9, color: '#aaa' }}>
            Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </div>
        </div>
      </div>
    </>
  );
}

import { useRef, useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminExportPDF() {
  const { schedules, ministers, masses } = useApp();
  const [month, setMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const getMass = (id) => masses.find((m) => m.id === id);
  const getMinister = (id) => ministers.find((m) => m.id === id);

  const monthStr = format(month, 'yyyy-MM');
  const monthSchedules = schedules
    .filter((s) => s.date.startsWith(monthStr))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (getMass(a.massId)?.time || '').localeCompare(getMass(b.massId)?.time || '');
    });

  // Agrupa por data
  const grouped = [];
  monthSchedules.forEach((s) => {
    const last = grouped[grouped.length - 1];
    if (last && last.date === s.date) last.schedules.push(s);
    else grouped.push({ date: s.date, schedules: [s] });
  });

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  }

  async function handleExport() {
    setLoading(true);
    try {
      const el = ref.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 16;
      const imgH = (canvas.height * imgW) / canvas.width;

      let y = 8, remaining = imgH, srcY = 0;
      while (remaining > 0) {
        const sliceH = Math.min(remaining, pageH - 16);
        const srcSlice = (sliceH / imgH) * canvas.height;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(srcSlice);
        sliceCanvas.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcSlice, 0, 0, canvas.width, srcSlice);
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 8, y, imgW, sliceH);
        remaining -= sliceH;
        srcY += srcSlice;
        if (remaining > 0) { pdf.addPage(); y = 8; }
      }

      pdf.save(`escala-detalhada-${format(month, 'MMMM-yyyy', { locale: ptBR })}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  const monthLabel = format(month, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-4">
      {/* Seletor de mês + botão exportar */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth((m) => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <ChevronDown className="w-4 h-4 text-gray-500 rotate-90" />
          </button>
          <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize text-sm w-36 text-center">
            {monthLabel}
          </span>
          <button onClick={() => setMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
          </button>
        </div>
        <button
          onClick={handleExport}
          disabled={loading || grouped.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          {loading ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>

      {grouped.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Nenhuma escala neste mês</p>
      )}

      {/* Preview das escalas do mês */}
      {grouped.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700/40 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {grouped.length} dia(s) com escala · {monthSchedules.length} missa(s)
            </p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {grouped.map(({ date, schedules: ds }) => (
              <div key={date} className="px-4 py-2">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize mb-1">{formatDate(date)}</p>
                {ds.map((s) => {
                  const mass = getMass(s.massId);
                  const mins = s.ministerIds.map(getMinister).filter(Boolean);
                  return (
                    <div key={s.id} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      <span className="font-medium w-10 flex-shrink-0" style={{color:'var(--brown)'}}>{mass?.time}</span>
                      <span>{mins.map((m) => m.name).join(', ') || 'Sem ministros'}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template oculto para captura */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div ref={ref} style={{ width: 794, backgroundColor: '#fff', padding: '28px', fontFamily: 'sans-serif' }}>
          {/* Cabeçalho */}
          <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #8B6340', paddingBottom: 14 }}>
            <p style={{ color: '#8B6340', fontWeight: 700, fontSize: 14, margin: 0 }}>
              Paróquia Santíssima Trindade - Matriz São Jorge
            </p>
            <p style={{ color: '#8B6340', fontWeight: 600, fontSize: 11, margin: '3px 0 0' }}>
              Ministros Extraordinários da Distribuição da Sagrada Comunhão
            </p>
            <p style={{ color: '#444', fontSize: 13, fontWeight: 700, margin: '8px 0 0', textTransform: 'capitalize' }}>
              Escala Detalhada — {monthLabel}
            </p>
          </div>

          {/* Lista de escalas por dia */}
          {grouped.map(({ date, schedules: ds }) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{
                backgroundColor: '#f5ede3',
                borderLeft: '4px solid #8B6340',
                padding: '5px 10px',
                marginBottom: 6,
                borderRadius: '0 4px 4px 0',
              }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 11, color: '#8B6340', textTransform: 'capitalize' }}>
                  {formatDate(date)}
                </p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
                    <th style={{ textAlign: 'left', padding: '4px 8px', color: '#666', fontWeight: 600, width: 90, borderBottom: '1px solid #eee' }}>Missa</th>
                    <th style={{ textAlign: 'left', padding: '4px 8px', color: '#666', fontWeight: 600, borderBottom: '1px solid #eee' }}>Ministros</th>
                  </tr>
                </thead>
                <tbody>
                  {ds.map((s) => {
                    const mass = getMass(s.massId);
                    const mins = s.ministerIds.map(getMinister).filter(Boolean);
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '5px 8px', color: '#8B6340', fontWeight: 600 }}>{mass?.name}</td>
                        <td style={{ padding: '5px 8px', color: '#333' }}>
                          {mins.length === 0
                            ? <span style={{ color: '#e53e3e' }}>Sem ministros escalados</span>
                            : mins.map((m) => m.name).join(' · ')
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

          {/* Rodapé */}
          <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 8, textAlign: 'center', fontSize: 9, color: '#aaa' }}>
            Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
}

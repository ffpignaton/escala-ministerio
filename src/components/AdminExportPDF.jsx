import { useRef, useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ChevronDown, FileDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { T } from '../styles/tokens';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Seletor de mês + botão exportar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--brown-light)', borderRadius: 12, padding: '10px 14px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
          >
            <ChevronDown size={15} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <span style={{ ...T.heading, fontSize: 13, textTransform: 'capitalize', minWidth: 140, textAlign: 'center' }}>
            {monthLabel}
          </span>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
          >
            <ChevronDown size={15} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
        <button
          onClick={handleExport}
          disabled={loading || grouped.length === 0}
          style={{
            ...T.btnPrimary,
            opacity: (loading || grouped.length === 0) ? 0.5 : 1,
            cursor: (loading || grouped.length === 0) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
          ) : (
            <FileDown size={14} />
          )}
          {loading ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>

      {grouped.length === 0 && (
        <p style={{ ...T.small, textAlign: 'center', padding: '24px 0' }}>Nenhuma escala neste mês</p>
      )}

      {/* Preview */}
      {grouped.length > 0 && (
        <div style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ backgroundColor: 'var(--brown-light)', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
            <p style={T.label}>
              {grouped.length} dia(s) com escala · {monthSchedules.length} missa(s)
            </p>
          </div>
          <div style={{ maxHeight: 256, overflowY: 'auto' }}>
            {grouped.map(({ date, schedules: ds }) => (
              <div key={date} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ ...T.body, fontWeight: 600, fontSize: 12, textTransform: 'capitalize', marginBottom: 4 }}>{formatDate(date)}</p>
                {ds.map((s) => {
                  const mass = getMass(s.massId);
                  const mins = s.ministerIds.map(getMinister).filter(Boolean);
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                      <span style={{ ...T.small, fontSize: 11, fontWeight: 600, color: 'var(--brown)', minWidth: 38, flexShrink: 0 }}>{mass?.time}</span>
                      <span style={{ ...T.small, fontSize: 11 }}>{mins.map((m) => m.name).join(', ') || 'Sem ministros'}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template oculto para captura */}
      <div style={{ position: 'fixed', left: -9999, top: 0 }} aria-hidden="true">
        <div ref={ref} style={{ width: 794, backgroundColor: '#fff', padding: '28px', fontFamily: 'sans-serif' }}>
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

          {grouped.map(({ date, schedules: ds }) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{ backgroundColor: '#f5ede3', borderLeft: '4px solid #8B6340', padding: '5px 10px', marginBottom: 6, borderRadius: '0 4px 4px 0' }}>
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

          <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 8, textAlign: 'center', fontSize: 9, color: '#aaa' }}>
            Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
}

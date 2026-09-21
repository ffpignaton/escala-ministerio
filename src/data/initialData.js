// Dados iniciais de demonstração
export const initialMinisters = [
  { id: '1', name: 'Ana Lima', phone: '(11) 99999-0001', active: true },
  { id: '2', name: 'Carlos Silva', phone: '(11) 99999-0002', active: true },
  { id: '3', name: 'Maria Santos', phone: '(11) 99999-0003', active: true },
  { id: '4', name: 'João Oliveira', phone: '(11) 99999-0004', active: true },
  { id: '5', name: 'Lucia Ferreira', phone: '(11) 99999-0005', active: true },
  { id: '6', name: 'Pedro Costa', phone: '(11) 99999-0006', active: true },
];

export const initialMasses = [
  { id: 'm1', name: 'Missa das 7h', time: '07:00' },
  { id: 'm2', name: 'Missa das 9h', time: '09:00' },
  { id: 'm3', name: 'Missa das 19h', time: '19:00' },
];

// Gera escalas de exemplo para o mês atual
function generateDemoSchedules() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const schedules = [];

  const ministersPool = ['1', '2', '3', '4', '5', '6'];
  const massIds = ['m1', 'm2', 'm3'];

  // Adiciona escalas apenas para domingos e alguns dias de semana
  for (let day = 1; day <= 28; day++) {
    const date = new Date(year, month, day);
    const dow = date.getDay();
    if (dow === 0 || dow === 3 || dow === 6) {
      const massList = dow === 0 ? massIds : [massIds[1], massIds[2]];
      massList.forEach((massId, idx) => {
        const count = 2 + (idx % 2);
        const ministers = [];
        for (let i = 0; i < count; i++) {
          ministers.push(ministersPool[(day + idx + i) % ministersPool.length]);
        }
        schedules.push({
          id: `s-${day}-${massId}`,
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          massId,
          ministerIds: [...new Set(ministers)],
        });
      });
    }
  }
  return schedules;
}

export const initialSchedules = generateDemoSchedules();

// Hash SHA-256 simples para senha admin (padrão: "admin123")
export const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

export function hashPassword(password) {
  // Usa SubtleCrypto do browser
  return crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(password))
    .then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
}

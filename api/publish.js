// Vercel Serverless Function — POST /api/publish
// Recebe { ministers, masses, schedules } e salva em public/data.json via GitHub API

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'ffpignaton/escala-ministerio';
  const branch = process.env.GITHUB_BRANCH || 'main';
  const filePath = 'public/data.json';

  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN não configurado no servidor' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Corpo da requisição inválido' });
  }

  const { ministers, masses, schedules, notices } = body ?? {};
  if (!ministers || !masses || !schedules) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // 1. Busca o SHA atual do arquivo (necessário para atualizar)
  let sha;
  try {
    const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    }
  } catch {
    // arquivo ainda não existe — sha fica undefined (criação)
  }

  // 2. Envia o arquivo atualizado
  const content = Buffer.from(
    JSON.stringify({ ministers, masses, schedules, notices: notices ?? [] }, null, 2)
  ).toString('base64');

  const putBody = {
    message: `chore: atualiza escalas via painel admin [${new Date().toISOString().slice(0, 10)}]`,
    content,
    branch,
    ...(sha ? { sha } : {}),
  };

  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers,
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    return res.status(502).json({ error: 'Erro ao salvar no GitHub', detail: err.message });
  }

  return res.status(200).json({ ok: true });
}

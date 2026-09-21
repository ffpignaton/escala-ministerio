# ✝ Escala de Ministros de Eucaristia

App estático para gerenciar e publicar escalas de Ministros de Eucaristia. Desenvolvido com React + Vite + Tailwind CSS, hospedado gratuitamente no Vercel.

## 🚀 Deploy rápido

### 1. Subir para o GitHub

```bash
cd escala-ministerio
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/escala-ministerio.git
git push -u origin main
```

### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **"Add New Project"**
3. Importe o repositório `escala-ministerio`
4. As configurações já estão prontas via `vercel.json` — clique **Deploy**
5. Pronto! Você receberá uma URL pública (ex: `https://escala-ministerio.vercel.app`)

## 🔐 Acesso Admin

- Clique no botão **Admin** no canto superior direito
- **Senha padrão:** `admin123`

> ⚠️ Para trocar a senha: gere o hash SHA-256 da nova senha e substitua `ADMIN_PASSWORD_HASH` em [`src/data/initialData.js`](src/data/initialData.js).
> Você pode gerar o hash em: https://emn178.github.io/online-tools/sha256.html

## 📱 Funcionalidades

### Para os Ministros (público)
- 📅 **Calendário mensal** com indicador visual de dias com escala
- 🔍 **Busca por nome** — filtra o calendário mostrando apenas os dias em que o ministro está escalado
- ⛪ **Filtro por missa** — visualize apenas uma missa específica
- 🌗 **Modo escuro** automático (segue preferência do sistema)
- 🖨️ **Impressão / PDF** — botão de impressão para salvar o calendário

### Para o Administrador
- 👥 **Cadastro de ministros** (nome, telefone, status ativo/inativo)
- ⛪ **Cadastro de missas** (nome e horário)
- 📆 **Criação de escalas** por data e missa, com seleção de ministros
- 💾 **Export/Import JSON** — backup e restauração dos dados
- 🎨 Indicador de dias com poucos ministros (amarelo/vermelho)

## 💾 Dados

Os dados são salvos no **localStorage** do navegador. Para persistência cross-dispositivo:
- Use os botões **Exportar** (⬇) e **Importar** (⬆) no painel admin
- Salve o JSON exportado no repositório GitHub como `public/data.json` (melhoria futura com GitHub API)

## 🛠 Desenvolvimento local

```bash
npm install
npm run dev
```

Abra http://localhost:5173

## 📦 Build

```bash
npm run build
```

## 🏗 Estrutura

```
src/
├── components/
│   ├── Calendar.jsx        # Calendário principal
│   ├── DayModal.jsx        # Expansão do dia com escala
│   ├── AdminLogin.jsx      # Login do administrador
│   ├── AdminPanel.jsx      # Painel admin (wrapper)
│   ├── MinistersPanel.jsx  # CRUD de ministros
│   ├── SchedulesPanel.jsx  # CRUD de escalas
│   └── MassesPanel.jsx     # CRUD de missas
├── context/
│   └── AppContext.jsx      # Estado global + localStorage
└── data/
    └── initialData.js      # Dados de demonstração
```

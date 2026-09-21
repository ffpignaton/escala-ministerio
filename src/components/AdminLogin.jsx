import { useState } from 'react';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLogin({ onClose }) {
  const { login } = useApp();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(password);
    setLoading(false);
    if (!ok) {
      setError('Senha incorreta. Tente novamente.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Área do Administrador</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Digite a senha para acessar o painel de administração
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Entrar
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
          Senha padrão: <code className="font-mono">admin123</code>
        </p>
      </div>
    </div>
  );
}

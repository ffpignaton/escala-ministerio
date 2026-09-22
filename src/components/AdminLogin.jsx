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
    if (ok) {
      onClose(true);
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{border:'1px solid var(--gold)'}}>

        {/* Header */}
        <div className="px-6 py-5 text-center" style={{backgroundColor:'var(--brown-dark)', borderBottom:'2px solid var(--gold)'}}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{backgroundColor:'rgba(201,168,76,0.15)', border:'1.5px solid var(--gold)'}}>
            <Lock className="w-6 h-6" style={{color:'var(--gold)'}} />
          </div>
          <h2 style={{fontFamily:"'Cinzel', serif", color:'var(--gold)', fontSize:15, letterSpacing:'0.08em', fontWeight:600}}>
            Área Administrativa
          </h2>
          <p style={{fontFamily:"'EB Garamond', serif", color:'rgba(245,237,227,0.7)', fontSize:13, fontStyle:'italic', marginTop:4}}>
            Digite a senha para continuar
          </p>
        </div>

        {/* Corpo */}
        <div className="px-6 py-5" style={{backgroundColor:'var(--cream)'}}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-4 py-3 pr-12 text-sm focus:outline-none"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  backgroundColor: '#FFF8F0',
                  color: 'var(--text)',
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 15,
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{color:'var(--muted)'}}
                tabIndex={-1}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2"
                style={{backgroundColor:'#FAE0E0', color:'#8B2222', border:'1px solid #E8B4B4', fontFamily:"'EB Garamond', serif"}}>
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-sm transition-opacity hover:opacity-70"
                style={{border:'1px solid var(--border)', borderRadius:10, color:'var(--muted)', backgroundColor:'transparent', fontFamily:"'Cinzel', serif", fontSize:11, letterSpacing:'0.05em'}}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !password}
                className="flex-1 py-3 text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{backgroundColor:'var(--brown-dark)', color:'var(--gold)', border:'1.5px solid var(--gold)', borderRadius:10, fontFamily:"'Cinzel', serif", fontSize:11, letterSpacing:'0.05em'}}
              >
                {loading
                  ? <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{borderColor:'var(--gold)', borderTopColor:'transparent'}} />
                  : <LogIn className="w-4 h-4" />}
                Entrar
              </button>
            </div>
          </form>

          <p className="text-center mt-4 text-xs" style={{color:'var(--muted)', fontFamily:"'EB Garamond', serif", fontStyle:'italic'}}>
            Senha padrão: <code style={{fontFamily:'monospace', backgroundColor:'var(--brown-light)', padding:'1px 5px', borderRadius:4}}>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}

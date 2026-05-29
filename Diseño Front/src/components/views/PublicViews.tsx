/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight, HelpCircle, GraduationCap } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (email: string, role: 'admin' | 'preceptor' | 'docente' | 'padre') => void;
}

export function LoginPage({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      // Smart Auto-Role mapping based on credentials list for convenient prototype testing
      const lower = email.toLowerCase();
      if (lower.includes('admin')) {
        onLoginSuccess(email, 'admin');
      } else if (lower.includes('marta') || lower.includes('preceptor')) {
        onLoginSuccess(email, 'preceptor');
      } else if (lower.includes('mariana') || lower.includes('docente')) {
        onLoginSuccess(email, 'docente');
      } else if (lower.includes('ana') || lower.includes('padre')) {
        onLoginSuccess(email, 'padre');
      } else {
        // Fallback or random role
        onLoginSuccess(email, 'admin');
      }
    }, 1000);
  };

  const setCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-slate-900 select-none">
      {/* Dynamic warm energetic glowing backdrops matching design instructions */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-800/80 via-amber-800/70 to-orange-950 backdrop-blur-[6px]"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-amber-500/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-600/20 blur-[130px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header decoration */}
        <header className="flex flex-col items-center mb-8 w-full text-center">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
            <GraduationCap size={44} className="text-amber-600 stroke-[1.8]" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-white font-bold tracking-tight drop-shadow-md">
            Gestión Escolar
          </h1>
          <p className="text-sm text-amber-200 mt-2 font-medium tracking-wide">
            EduConnect Access Portal
          </p>
        </header>

        {/* glass-panel for main visual focus */}
        <div className="glass-panel w-full rounded-[32px] p-8 shadow-2xl transition-all duration-300">
          <div className="text-center mb-6">
            <h2 className="font-display text-xl md:text-2xl font-bold text-slate-800">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold border border-red-100 flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <Mail size={18} />
                </span>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@colegio.edu"
                  className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-800 font-medium border-2 border-transparent focus:border-amber-500 outline-none transition-all placeholder:text-slate-400 font-sans"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-1">Contraseña</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-slate-800 font-medium border-2 border-transparent focus:border-amber-500 outline-none transition-all placeholder:text-slate-400 font-sans"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <a href="#forgot" className="text-xs text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full py-3.5 font-semibold text-sm shadow-md hover:-translate-y-[2px] active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Ingresando al Sistema...' : 'Ingresar al Sistema'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Preset Buttons for easy prototype traversal */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2.5 text-center">
              Probar Accesos Rápidos
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setCredentials('admin@educonnect.com', 'admin123')}
                className="py-2.5 px-3 bg-red-50 hover:bg-slate-100 text-red-700 rounded-xl font-medium text-left border border-red-100 transition-all cursor-pointer"
              >
                💼 <b>Admin</b> Admin
              </button>
              <button 
                onClick={() => setCredentials('marta.gomez@school.edu', 'marta123')}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-slate-100 text-emerald-700 rounded-xl font-medium text-left border border-emerald-100 transition-all cursor-pointer"
              >
                🎒 <b>Preceptora</b> Marta
              </button>
              <button 
                onClick={() => setCredentials('mariana.lopez@school.edu', 'mariana123')}
                className="py-2.5 px-3 bg-amber-50 hover:bg-slate-100 text-amber-700 rounded-xl font-medium text-left border border-amber-100 transition-all cursor-pointer"
              >
                👩‍🏫 <b>Docente</b> Mariana
              </button>
              <button 
                onClick={() => setCredentials('ana.rodriguez@gmail.com', 'ana123')}
                className="py-2.5 px-3 bg-fuchsia-50 hover:bg-slate-100 text-fuchsia-700 rounded-xl font-medium text-left border border-fuchsia-100 transition-all cursor-pointer"
              >
                👪 <b>Familiar</b> Ana
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-50">
            <HelpCircle size={16} className="text-slate-400" />
            <a href="#help" className="text-xs text-slate-500 hover:text-amber-600 transition-colors">
              Necesito ayuda para acceder
            </a>
          </div>
        </div>

        <div className="mt-8 text-center opacity-70">
          <span className="bg-slate-800/80 text-white border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold font-mono">
            v2.4.1 • Conexión Segura SSL
          </span>
        </div>
      </div>
    </div>
  );
}

interface RedirectProps {
  onReturn: () => void;
}

export function UnauthorizedPage({ onReturn }: RedirectProps) {
  return (
    <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px] max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner animate-pulse">
        <ShieldAlert size={44} />
      </div>
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">Acceso no autorizado</h2>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-sm">
          No tienes los permisos asignados en el perfil de usuario para ver esta sección. Si consideras que es un error, contacta al Administrador.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
        <button 
          onClick={onReturn}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3 text-sm font-semibold transition-transform active:scale-95 cursor-pointer"
        >
          Volver a mi Dashboard
        </button>
      </div>
    </div>
  );
}

export function NotFoundPage({ onReturn }: RedirectProps) {
  return (
    <div className="py-12 px-6 text-center flex flex-col items-center justify-center min-h-[450px] max-w-lg mx-auto space-y-6 select-none">
      <div className="relative">
        <span className="font-display text-8xl md:text-9xl font-bold text-amber-500 opacity-20">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <GraduationCap size={72} className="text-orange-500 opacity-80" />
        </div>
      </div>
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">Página no encontrada</h2>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          El enlace al que estás intentando acceder no existe o fue movido temporalmente por reorganización académica.
        </p>
      </div>
      <button 
        onClick={onReturn}
        className="bg-amber-500 hover:bg-amber-600 text-white rounded-full py-3 px-8 text-sm font-semibold shadow-md transition-transform active:scale-95 cursor-pointer-none"
      >
        Volver al Inicio
      </button>
    </div>
  );
}

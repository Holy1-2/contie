
import React, { useState } from 'react';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { Language, Translation } from '../types';
import BackgroundBlobs from './BackgroundBlobs';

interface AuthViewProps {
  onLogin: (email: string) => void;
  language: Language;
  translations: Translation;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, translations }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 selection:bg-purple-500/30">
      <BackgroundBlobs />
      
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-1000">
        <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-600 to-fuchsia-600 shadow-2xl shadow-purple-500/30 mb-2 animate-float">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-outfit font-bold tracking-tight text-white mb-2">
                {translations.title}
              </h1>
              <p className="text-neutral-400 font-medium text-lg">
                {mode === 'login' ? translations.signIn : translations.signUp}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">{translations.displayName}</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={translations.namePlaceholder}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:bg-white/[0.06] transition-all placeholder:text-neutral-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">{translations.email}</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:bg-white/[0.06] transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">{translations.password}</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:bg-white/[0.06] transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 hover:brightness-110 text-white font-bold text-lg rounded-2xl shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all"
            >
              {mode === 'login' ? translations.signIn : translations.signUp}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-neutral-500 hover:text-white text-sm font-semibold transition-colors"
            >
              {mode === 'login' ? translations.createAccount : translations.existingAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

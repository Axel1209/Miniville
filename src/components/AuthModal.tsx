import React, { useState } from 'react';
import { X, UserCheck, UserPlus, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { getCurrentUser, loginUser, logoutUser, registerUser, UserProfile } from '../game/auth';

interface AuthModalProps {
  onClose: () => void;
  onUserChanged: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onUserChanged }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(getCurrentUser());
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'login') {
      const res = loginUser(username, password);
      if (res.success && res.user) {
        setCurrentUserState(res.user);
        onUserChanged(res.user);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = registerUser(username, password);
      if (res.success && res.user) {
        setCurrentUserState(res.user);
        onUserChanged(res.user);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    onUserChanged(null);
    setSuccessMsg('Vous êtes maintenant déconnecté.');
    setErrorMsg('');
  };

  const getWinRate = (games: number, wins: number) => {
    if (games === 0) return '0.0%';
    return `${((wins / games) * 100).toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {currentUser ? (
          /* LOGGED IN VIEW */
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <ShieldCheck size={28} />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{currentUser.username}</h2>
                <p className="text-xs text-slate-400">Joueur Enregistré</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Statistiques du Profil</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                  <p className="text-xs text-blue-300 font-semibold mb-1">Mode Solo</p>
                  <p className="text-white font-bold">{currentUser.stats.solo.wins} / {currentUser.stats.solo.games} victoires</p>
                  <p className="text-xs text-blue-200 mt-1">
                    % Victoires: {getWinRate(currentUser.stats.solo.games, currentUser.stats.solo.wins)}
                  </p>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                  <p className="text-xs text-indigo-300 font-semibold mb-1">Mode Groupe</p>
                  <p className="text-white font-bold">{currentUser.stats.group.wins} / {currentUser.stats.group.games} victoires</p>
                  <p className="text-xs text-indigo-200 mt-1">
                    % Victoires: {getWinRate(currentUser.stats.group.games, currentUser.stats.group.wins)}
                  </p>
                </div>
              </div>

              {(() => {
                const totalG = currentUser.stats.solo.games + currentUser.stats.group.games;
                const totalW = currentUser.stats.solo.wins + currentUser.stats.group.wins;
                return (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center">
                    <p className="text-xs text-emerald-300 font-semibold">Taux de Victoires Global</p>
                    <p className="text-xl font-bold text-white mt-0.5">{getWinRate(totalG, totalW)}</p>
                    <p className="text-xs text-slate-400">{totalW} victoires sur {totalG} parties au total</p>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              <span>Se déconnecter</span>
            </button>
          </div>
        ) : (
          /* LOGIN / REGISTER FORM */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {mode === 'login' ? <LogIn size={22} className="text-blue-400" /> : <UserPlus size={22} className="text-emerald-400" />}
                <span>{mode === 'login' ? 'Connexion' : 'Créer un Compte'}</span>
              </h2>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'register' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inscription
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Identifiant / Pseudo</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: Axel"
                  required
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 font-semibold text-white rounded-xl transition-all shadow-md ${
                  mode === 'login' 
                    ? 'bg-blue-600 hover:bg-blue-500 border border-blue-400/30' 
                    : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30'
                }`}
              >
                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>

            <p className="text-xs text-slate-400 text-center">
              * L'inscription est optionnelle. Seuls les joueurs inscrits apparaissent dans le classement des scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

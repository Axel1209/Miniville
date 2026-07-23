import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, User } from 'lucide-react';
import { getCurrentUser, UserProfile } from '../game/auth';

interface SetupScreenProps {
  onStart: (players: string[], aiCount: number) => void;
  onShowRules: () => void;
  onPlayOnline: () => void;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
  currentUser: UserProfile | null;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStart,
  onShowRules,
  onPlayOnline,
  onOpenAuth,
  onOpenLeaderboard,
  currentUser,
}) => {
  const [playerCount, setPlayerCount] = useState(1);
  const [aiCount, setAiCount] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>(['Joueur 1']);

  useEffect(() => {
    if (currentUser) {
      setPlayerNames((prev) => {
        const copy = [...prev];
        copy[0] = currentUser.username;
        return copy;
      });
    }
  }, [currentUser]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(playerNames, aiCount);
  };

  const updateName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(
      Array.from({ length: count }, (_, i) => {
        if (i === 0 && currentUser) return currentUser.username;
        return playerNames[i] || `Joueur ${i + 1}`;
      })
    );
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative">
      {/* Top Header Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10 flex-wrap justify-end">
        <button 
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 hover:text-white rounded-full transition-all backdrop-blur-md"
        >
          <User size={16} />
          <span>{currentUser ? currentUser.username : 'Compte'}</span>
        </button>

        <button 
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-300 bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 hover:text-white rounded-full transition-all backdrop-blur-md"
        >
          <Trophy size={16} className="text-amber-400" />
          <span>Scores</span>
        </button>

        <button 
          onClick={onShowRules}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-300 bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 hover:text-white rounded-full transition-all backdrop-blur-md"
        >
          <BookOpen size={16} />
          <span>Règles</span>
        </button>
      </div>

      <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-8 max-w-md w-full my-12">
        <h1 className="text-3xl font-bold text-center text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] tracking-tight mb-8">Miniville</h1>
        
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre de joueurs humains ({playerCount})
            </label>
            <input 
              type="range" 
              min="1" 
              max="4" 
              value={playerCount} 
              onChange={(e) => handlePlayerCountChange(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            {playerNames.map((name, i) => (
              <div key={i}>
                <label className="block text-xs font-medium text-slate-400 mb-1 tracking-widest uppercase">
                  Nom du Joueur {i + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all shadow-inner"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre d'IA ({aiCount})
            </label>
            <input 
              type="range" 
              min="0" 
              max={4 - playerCount} 
              value={aiCount} 
              onChange={(e) => setAiCount(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
              disabled={playerCount === 4}
            />
            <p className="text-xs text-slate-400 mt-1">
              Total de joueurs : {playerCount + aiCount} (max 4)
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] cursor-pointer"
          >
            Lancer la partie
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative px-3 bg-[#0f172a] text-xs font-semibold text-slate-500 uppercase tracking-widest">Ou</span>
          </div>

          <button
            type="button"
            onClick={onPlayOnline}
            className="w-full bg-gradient-to-r from-indigo-600/30 to-indigo-500/30 text-indigo-300 font-semibold py-3 rounded-xl hover:from-indigo-600/40 hover:to-indigo-500/40 hover:text-indigo-200 transition-all border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Jouer en Ligne 🌐</span>
          </button>
        </form>
      </div>
    </div>
  );
};

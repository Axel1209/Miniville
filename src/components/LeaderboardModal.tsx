import React, { useState } from 'react';
import { X, Trophy, Medal, Filter, Users, User } from 'lucide-react';
import { getCurrentUser, getRegisteredUsers, UserProfile } from '../game/auth';

interface LeaderboardModalProps {
  onClose: () => void;
  onOpenAuth: () => void;
}

interface RankedUser {
  user: UserProfile;
  totalGames: number;
  totalWins: number;
  winRate: number;
  soloWinRate: number;
  groupWinRate: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, onOpenAuth }) => {
  const [showAll, setShowAll] = useState(false);
  const currentUser = getCurrentUser();
  const rawUsers = getRegisteredUsers();

  const rankedUsers: RankedUser[] = rawUsers
    .map((user) => {
      const totalGames = user.stats.solo.games + user.stats.group.games;
      const totalWins = user.stats.solo.wins + user.stats.group.wins;
      const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
      const soloWinRate =
        user.stats.solo.games > 0
          ? (user.stats.solo.wins / user.stats.solo.games) * 100
          : 0;
      const groupWinRate =
        user.stats.group.games > 0
          ? (user.stats.group.wins / user.stats.group.games) * 100
          : 0;

      return {
        user,
        totalGames,
        totalWins,
        winRate,
        soloWinRate,
        groupWinRate,
      };
    })
    .sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
      return b.totalGames - a.totalGames;
    });

  const filteredUsers = showAll
    ? rankedUsers
    : rankedUsers.filter((u) => u.totalGames >= 5);

  const getRankBadge = (index: number) => {
    if (index === 0) return <span className="text-xl">🥇</span>;
    if (index === 1) return <span className="text-xl">🥈</span>;
    if (index === 2) return <span className="text-xl">🥉</span>;
    return <span className="font-bold text-slate-400">#{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 sm:p-6">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-[#0f172a]">
          <div className="flex items-center gap-3 text-amber-400">
            <Trophy size={26} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Tableau des Scores</h2>
              <p className="text-xs text-slate-400">Classement officiel des joueurs par pourcentage de victoires</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 py-3 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Filter size={16} className="text-blue-400" />
            <span>Filtre d'affichage :</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-slate-200">
              Afficher tous les joueurs <span className="text-slate-400 text-xs">(moins de 5 parties incluses)</span>
            </span>
          </label>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Medal size={48} className="mx-auto text-slate-600" />
              <p className="text-slate-300 font-semibold text-base">Aucun joueur dans ce classement pour l'instant.</p>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                {!showAll && rawUsers.length > 0
                  ? "Par défaut, seuls les joueurs ayant au moins 5 parties apparaissent. Cochez l'option ci-dessus pour tout afficher !"
                  : "Inscrivez-vous pour que vos parties en Solo et en Groupe soient comptabilisées dans le classement."}
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
                >
                  S'inscrire / Se connecter
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-center">Rang</th>
                    <th className="py-3 px-4">Joueur</th>
                    <th className="py-3 px-4 text-center text-amber-300 font-bold">% Victoires Global</th>
                    <th className="py-3 px-4 text-center">Total Parties</th>
                    <th className="py-3 px-4 text-center">Victoires</th>
                    <th className="py-3 px-4 text-center">Mode Solo</th>
                    <th className="py-3 px-4 text-center">Mode Groupe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((item, idx) => {
                    const isMe = currentUser?.id === item.user.id;
                    return (
                      <tr 
                        key={item.user.id} 
                        className={`transition-colors hover:bg-white/5 ${
                          isMe ? 'bg-amber-500/10 border-l-4 border-amber-400' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-semibold">
                          {getRankBadge(idx)}
                        </td>
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <span>{item.user.username}</span>
                          {isMe && (
                            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] rounded-full font-semibold">
                              Vous
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-amber-400 font-extrabold text-base">
                          {item.winRate.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-200">
                          {item.totalGames}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                          {item.totalWins}
                        </td>
                        <td className="py-3 px-4 text-center text-xs">
                          <span className="text-slate-200 font-medium">{item.user.stats.solo.wins}/{item.user.stats.solo.games}</span>
                          <span className="text-slate-400 ml-1">({item.soloWinRate.toFixed(0)}%)</span>
                        </td>
                        <td className="py-3 px-4 text-center text-xs">
                          <span className="text-slate-200 font-medium">{item.user.stats.group.wins}/{item.user.stats.group.games}</span>
                          <span className="text-slate-400 ml-1">({item.groupWinRate.toFixed(0)}%)</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0f172a] flex justify-between items-center">
          <p className="text-xs text-slate-400">
            * Seules les parties terminées avec au moins 1 joueur inscrit sont comptabilisées.
          </p>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

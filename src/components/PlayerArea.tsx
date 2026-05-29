import React from 'react';
import { Player, CardId, MonumentId } from '../game/types';
import { CARDS, MONUMENTS } from '../game/cards';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface PlayerAreaProps {
  player: Player;
  isActive: boolean;
  isConnected?: boolean;
  isOnlineMode?: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ player, isActive, isConnected = true, isOnlineMode = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-[rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl shadow-lg border ${isActive ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/50' : 'border-white/10'} p-4 flex-shrink-0 min-w-[300px]`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isOnlineMode && (
            <div 
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}
              title={isConnected ? 'En ligne' : 'Déconnecté'}
            />
          )}
          <h3 className={`font-bold text-lg tracking-tight ${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'text-white'}`}>
            {player.name} {player.isAI && '(IA)'}
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full font-bold">
          <Icons.Coins size={16} />
          <span>{player.coins}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Monuments</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(player.monuments).map(([id, built]) => {
              const monument = MONUMENTS[id as MonumentId];
              if (!monument) return null;
              const Icon = (Icons as any)[monument.icon] || Icons.Building;
              return (
                <div 
                  key={id} 
                  className={`flex flex-col items-center p-2 rounded-lg border relative transition-colors ${built ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-black/20 border-white/5 text-slate-500 opacity-60'}`}
                  title={`${monument.name} (Coût: ${monument.cost}) - ${monument.description}`}
                >
                  <Icon size={20} className="mb-1" />
                  <span className="text-[10px] font-medium text-center leading-tight max-w-[60px]">{monument.name}</span>
                  {!built && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500/20 text-yellow-300 backdrop-blur-md text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-500/30 flex items-center gap-0.5">
                      <Icons.Coins size={8} />
                      {monument.cost}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Établissements</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(player.cards).map(([id, count]) => {
              if (count === 0) return null;
              const card = CARDS[id as CardId];
              if (!card) return null;
              const Icon = (Icons as any)[card.icon] || Icons.Home;
              
              let bgColor = '';
              let textColor = '';
              let borderColor = '';
              
              switch (card.color) {
                case 'BLUE': bgColor = 'bg-blue-500/20'; textColor = 'text-blue-300'; borderColor = 'border-blue-500/30'; break;
                case 'GREEN': bgColor = 'bg-emerald-500/20'; textColor = 'text-emerald-300'; borderColor = 'border-emerald-500/30'; break;
                case 'RED': bgColor = 'bg-rose-500/20'; textColor = 'text-rose-300'; borderColor = 'border-rose-500/30'; break;
                case 'PURPLE': bgColor = 'bg-purple-500/20'; textColor = 'text-purple-300'; borderColor = 'border-purple-500/30'; break;
              }

              return (
                <div key={id} className={`flex items-center gap-2 px-2 py-1 rounded-md border ${bgColor} ${textColor} ${borderColor}`} title={card.description}>
                  <div className="flex items-center justify-center w-5 h-5 bg-black/40 border border-white/10 rounded-full text-xs font-bold shadow-sm">
                    {card.activations.join('-')}
                  </div>
                  <Icon size={14} />
                  <span className="text-xs font-medium">{card.name}</span>
                  <span className="ml-1 text-xs font-bold bg-black/30 border border-white/5 px-1.5 rounded-full text-white/90">x{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

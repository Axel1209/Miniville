import React from 'react';
import { Player, CardId, MonumentId } from '../game/types';
import { CARDS, MONUMENTS } from '../game/cards';
import * as Icons from 'lucide-react';

interface PlayerAreaProps {
  player: Player;
  isActive: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ player, isActive }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${isActive ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'} p-4 flex-shrink-0 min-w-[300px]`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-bold text-lg ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
          {player.name} {player.isAI && '(IA)'}
        </h3>
        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold">
          <Icons.Coins size={16} />
          <span>{player.coins}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Monuments</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(player.monuments).map(([id, built]) => {
              const monument = MONUMENTS[id as MonumentId];
              const Icon = (Icons as any)[monument.icon] || Icons.Building;
              return (
                <div 
                  key={id} 
                  className={`flex flex-col items-center p-2 rounded-lg border ${built ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'}`}
                  title={monument.description}
                >
                  <Icon size={20} className="mb-1" />
                  <span className="text-[10px] font-medium text-center leading-tight max-w-[60px]">{monument.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Établissements</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(player.cards).map(([id, count]) => {
              if (count === 0) return null;
              const card = CARDS[id as CardId];
              const Icon = (Icons as any)[card.icon] || Icons.Home;
              
              let bgColor = '';
              let textColor = '';
              let borderColor = '';
              
              switch (card.color) {
                case 'BLUE': bgColor = 'bg-blue-50'; textColor = 'text-blue-700'; borderColor = 'border-blue-200'; break;
                case 'GREEN': bgColor = 'bg-emerald-50'; textColor = 'text-emerald-700'; borderColor = 'border-emerald-200'; break;
                case 'RED': bgColor = 'bg-rose-50'; textColor = 'text-rose-700'; borderColor = 'border-rose-200'; break;
                case 'PURPLE': bgColor = 'bg-purple-50'; textColor = 'text-purple-700'; borderColor = 'border-purple-200'; break;
              }

              return (
                <div key={id} className={`flex items-center gap-2 px-2 py-1 rounded-md border ${bgColor} ${textColor} ${borderColor}`} title={card.description}>
                  <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full text-xs font-bold shadow-sm">
                    {card.activations.join('-')}
                  </div>
                  <Icon size={14} />
                  <span className="text-xs font-medium">{card.name}</span>
                  <span className="ml-1 text-xs font-bold bg-white/50 px-1.5 rounded-full">x{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

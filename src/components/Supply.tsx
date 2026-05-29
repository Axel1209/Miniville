import React from 'react';
import { GameState, CardId, TurnState, MonumentId } from '../game/types';
import { CARDS, MONUMENTS } from '../game/cards';
import { buildMonument, buyCard } from '../game/engine';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface SupplyProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  isMyTurn?: boolean;
}

export const Supply: React.FC<SupplyProps> = ({ gameState, setGameState, isMyTurn = true }) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const isBuyPhase = gameState.turnState === TurnState.BUY_PHASE && !activePlayer.isAI && isMyTurn;

  const handleBuyCard = (cardId: CardId) => {
    if (isBuyPhase) {
      setGameState(buyCard(gameState, cardId));
    }
  };

  const handleBuildMonument = (monumentId: MonumentId) => {
    if (isBuyPhase) {
      setGameState(buildMonument(gameState, monumentId));
    }
  };

  const renderCard = (cardId: CardId, count: number) => {
    const card = CARDS[cardId];
    if (!card) return null;
    
    const canAfford = activePlayer.coins >= card.cost;
    const isAvailable = count > 0;
    const isPurple = card.color === 'PURPLE';
    const hasPurple = activePlayer.cards[cardId] > 0;
    const canBuy = isBuyPhase && canAfford && isAvailable && (!isPurple || !hasPurple);
    
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
      <motion.button
        key={cardId}
        whileHover={canBuy ? { y: -2, scale: 1.02 } : {}}
        onClick={() => handleBuyCard(cardId)}
        disabled={!canBuy}
        className={`flex flex-col p-3 rounded-xl border transition-all text-left relative overflow-hidden backdrop-blur-sm
          ${canBuy ? `hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer ${borderColor} ${bgColor}` : 'opacity-40 cursor-not-allowed bg-black/20 border-white/5'}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-sm bg-black/40 border border-white/10 shadow-sm ${textColor}`}>
            {card.activations.join('-')}
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-500/30">
            <Icons.Coins size={12} />
            <span>{card.cost}</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 mb-1 ${canBuy ? textColor : 'text-slate-400'}`}>
          <Icon size={16} />
          <span className="font-bold text-sm truncate">{card.name}</span>
        </div>
        
        <p className="text-[10px] text-slate-400 leading-tight flex-1 mb-2">{card.description}</p>
        
        <div className="mt-auto pt-2 border-t border-white/10 flex justify-between items-center w-full">
          <span className="text-xs font-medium text-slate-500">Reste: {count}</span>
          {canBuy && <span className="text-xs font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Acheter</span>}
        </div>
      </motion.button>
    );
  };

  const renderMonument = (monumentId: MonumentId) => {
    const monument = MONUMENTS[monumentId];
    if (!monument) return null;
    
    const isBuilt = activePlayer.monuments[monumentId];
    const canAfford = activePlayer.coins >= monument.cost;
    const canBuy = isBuyPhase && canAfford && !isBuilt;
    
    const Icon = (Icons as any)[monument.icon] || Icons.Building;

    return (
      <motion.button
        key={monumentId}
        whileHover={canBuy ? { y: -2, scale: 1.02 } : {}}
        onClick={() => handleBuildMonument(monumentId)}
        disabled={!canBuy}
        className={`flex flex-col p-3 rounded-xl border transition-all text-left relative overflow-hidden backdrop-blur-sm
          ${isBuilt ? 'bg-blue-500/20 border-blue-500/40 opacity-60' : 
            canBuy ? 'hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer border-blue-400/50 bg-[rgba(59,130,246,0.05)] hover:bg-[rgba(59,130,246,0.1)]' : 
            'opacity-40 cursor-not-allowed bg-black/20 border-white/5'}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isBuilt ? 'bg-blue-500/30 text-blue-300' : 'bg-black/40 border border-white/10 text-slate-300'}`}>
            <Icon size={14} />
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
            <Icons.Coins size={12} />
            <span>{monument.cost}</span>
          </div>
        </div>
        
        <span className={`font-bold text-sm mb-1 truncate ${isBuilt ? 'text-blue-300' : canBuy ? 'text-blue-100' : 'text-slate-400'}`}>{monument.name}</span>
        <p className="text-[10px] text-slate-400 leading-tight flex-1 mb-2">{monument.description}</p>
        
        <div className="mt-auto pt-2 border-t border-white/10 flex justify-between items-center w-full">
          <span className="text-xs font-medium text-slate-500">{isBuilt ? 'Construit' : 'Non construit'}</span>
          {canBuy && <span className="text-xs font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Construire</span>}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Monuments (Victoire)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(MonumentId).map(id => renderMonument(id as MonumentId))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Établissements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(gameState.supply).map(([id, count]) => renderCard(id as CardId, count as number))}
        </div>
      </div>
    </div>
  );
};

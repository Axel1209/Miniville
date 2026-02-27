import React from 'react';
import { GameState, CardId, TurnState, MonumentId } from '../game/types';
import { CARDS, MONUMENTS } from '../game/cards';
import { buyCard, buildMonument } from '../game/engine';
import * as Icons from 'lucide-react';

interface SupplyProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

export const Supply: React.FC<SupplyProps> = ({ gameState, setGameState }) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const isBuyPhase = gameState.turnState === TurnState.BUY_PHASE && !activePlayer.isAI;

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
      case 'BLUE': bgColor = 'bg-blue-50'; textColor = 'text-blue-700'; borderColor = 'border-blue-200'; break;
      case 'GREEN': bgColor = 'bg-emerald-50'; textColor = 'text-emerald-700'; borderColor = 'border-emerald-200'; break;
      case 'RED': bgColor = 'bg-rose-50'; textColor = 'text-rose-700'; borderColor = 'border-rose-200'; break;
      case 'PURPLE': bgColor = 'bg-purple-50'; textColor = 'text-purple-700'; borderColor = 'border-purple-200'; break;
    }

    return (
      <button
        key={cardId}
        onClick={() => handleBuyCard(cardId)}
        disabled={!canBuy}
        className={`flex flex-col p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden
          ${canBuy ? `hover:shadow-md cursor-pointer ${borderColor} ${bgColor}` : 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-sm bg-white shadow-sm ${textColor}`}>
            {card.activations.join('-')}
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">
            <Icons.Coins size={12} />
            <span>{card.cost}</span>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 mb-1 ${textColor}`}>
          <Icon size={16} />
          <span className="font-bold text-sm truncate">{card.name}</span>
        </div>
        
        <p className="text-[10px] text-slate-600 leading-tight flex-1 mb-2">{card.description}</p>
        
        <div className="mt-auto pt-2 border-t border-black/5 flex justify-between items-center w-full">
          <span className="text-xs font-medium text-slate-500">Reste: {count}</span>
          {canBuy && <span className="text-xs font-bold text-indigo-600">Acheter</span>}
        </div>
      </button>
    );
  };

  const renderMonument = (monumentId: MonumentId) => {
    const monument = MONUMENTS[monumentId];
    const isBuilt = activePlayer.monuments[monumentId];
    const canAfford = activePlayer.coins >= monument.cost;
    const canBuy = isBuyPhase && canAfford && !isBuilt;
    
    const Icon = (Icons as any)[monument.icon] || Icons.Building;

    return (
      <button
        key={monumentId}
        onClick={() => handleBuildMonument(monumentId)}
        disabled={!canBuy}
        className={`flex flex-col p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden
          ${isBuilt ? 'bg-indigo-50 border-indigo-200 opacity-60' : 
            canBuy ? 'hover:shadow-md cursor-pointer border-indigo-300 bg-white' : 
            'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700">
            <Icon size={14} />
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">
            <Icons.Coins size={12} />
            <span>{monument.cost}</span>
          </div>
        </div>
        
        <span className="font-bold text-sm text-indigo-900 mb-1 truncate">{monument.name}</span>
        <p className="text-[10px] text-slate-600 leading-tight flex-1 mb-2">{monument.description}</p>
        
        <div className="mt-auto pt-2 border-t border-black/5 flex justify-between items-center w-full">
          <span className="text-xs font-medium text-slate-500">{isBuilt ? 'Construit' : 'Non construit'}</span>
          {canBuy && <span className="text-xs font-bold text-indigo-600">Construire</span>}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Monuments (Victoire)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(MonumentId).map(id => renderMonument(id as MonumentId))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Établissements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(gameState.supply).map(([id, count]) => renderCard(id as CardId, count))}
        </div>
      </div>
    </div>
  );
};

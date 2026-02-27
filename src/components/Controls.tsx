import React, { useState } from 'react';
import { GameState, TurnState, MonumentId, CardId } from '../game/types';
import { rollDice, rerollDice, endTurn, resolvePurpleAction } from '../game/engine';
import { CARDS } from '../game/cards';
import * as Icons from 'lucide-react';

interface ControlsProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

export const Controls: React.FC<ControlsProps> = ({ gameState, setGameState }) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const isAI = activePlayer.isAI;
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedGive, setSelectedGive] = useState<CardId | ''>('');
  const [selectedTake, setSelectedTake] = useState<CardId | ''>('');

  if (gameState.winner) {
    return (
      <div className="bg-green-100 border border-green-300 rounded-xl p-6 text-center">
        <Icons.Trophy className="mx-auto text-green-600 mb-2" size={48} />
        <h3 className="text-xl font-bold text-green-800 mb-1">{gameState.players.find(p => p.id === gameState.winner)?.name} a gagné !</h3>
        <p className="text-sm text-green-700">Tous les monuments ont été construits.</p>
      </div>
    );
  }

  if (isAI) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center flex flex-col items-center justify-center">
        <Icons.Bot className="text-slate-400 mb-3 animate-bounce" size={32} />
        <p className="text-slate-600 font-medium">L'IA réfléchit...</p>
      </div>
    );
  }

  const renderDiceResult = () => {
    if (gameState.diceResult.length === 0) return null;
    return (
      <div className="flex justify-center gap-4 mb-6">
        {gameState.diceResult.map((val, i) => (
          <div key={i} className="w-16 h-16 bg-white border-2 border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-3xl font-bold text-slate-800">
            {val}
          </div>
        ))}
      </div>
    );
  };

  switch (gameState.turnState) {
    case TurnState.START_TURN:
    case TurnState.CHOOSE_DICE: {
      const canRollTwo = activePlayer.monuments[MonumentId.GARE];
      return (
        <div className="space-y-4">
          <p className="text-center text-slate-600 font-medium mb-4">Combien de dés voulez-vous lancer ?</p>
          <button
            onClick={() => setGameState(rollDice(gameState, 1))}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Icons.Dices size={20} />
            Lancer 1 dé
          </button>
          
          {canRollTwo && (
            <button
              onClick={() => setGameState(rollDice(gameState, 2))}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Icons.Dices size={20} />
              Lancer 2 dés
            </button>
          )}
        </div>
      );
    }

    case TurnState.OPTIONAL_REROLL:
      return (
        <div className="space-y-4">
          {renderDiceResult()}
          <p className="text-center text-slate-600 font-medium mb-4">Voulez-vous relancer les dés (Tour Radio) ?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setGameState(rerollDice(gameState, true))}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Oui, relancer
            </button>
            <button
              onClick={() => setGameState(rerollDice(gameState, false))}
              className="flex-1 bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl hover:bg-slate-300 transition-colors shadow-sm"
            >
              Non, garder
            </button>
          </div>
        </div>
      );

    case TurnState.PURPLE_ACTION: {
      const action = gameState.pendingPurpleActions[0];
      
      if (action.type === 'STEAL_5') {
        const targets = gameState.players.filter(p => p.id !== activePlayer.id);
        return (
          <div className="space-y-4">
            {renderDiceResult()}
            <p className="text-center text-slate-600 font-medium mb-4">À qui voulez-vous voler 5 pièces ?</p>
            <select 
              className="w-full p-3 rounded-xl border border-slate-300 mb-4"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              <option value="">Sélectionner un joueur</option>
              {targets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.coins} pièces)</option>)}
            </select>
            <button
              onClick={() => {
                if (selectedTarget) {
                  setGameState(resolvePurpleAction(gameState, 0, selectedTarget));
                  setSelectedTarget('');
                }
              }}
              disabled={!selectedTarget}
              className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Voler
            </button>
          </div>
        );
      } else if (action.type === 'TRADE_CARD') {
        const targets = gameState.players.filter(p => p.id !== activePlayer.id);
        const myCards = Object.entries(activePlayer.cards).filter(([id, count]) => count > 0 && CARDS[id as CardId].color !== 'PURPLE');
        const targetPlayer = gameState.players.find(p => p.id === selectedTarget);
        const targetCards = targetPlayer ? Object.entries(targetPlayer.cards).filter(([id, count]) => count > 0 && CARDS[id as CardId].color !== 'PURPLE') : [];

        return (
          <div className="space-y-4">
            {renderDiceResult()}
            <p className="text-center text-slate-600 font-medium mb-2">Échange de carte (Centre d'affaires)</p>
            
            <select 
              className="w-full p-2 rounded-lg border border-slate-300 text-sm"
              value={selectedTarget}
              onChange={(e) => { setSelectedTarget(e.target.value); setSelectedTake(''); }}
            >
              <option value="">1. Choisir un joueur</option>
              {targets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select 
              className="w-full p-2 rounded-lg border border-slate-300 text-sm"
              value={selectedGive}
              onChange={(e) => setSelectedGive(e.target.value as CardId)}
            >
              <option value="">2. Carte à donner</option>
              {myCards.map(([id]) => <option key={id} value={id}>{CARDS[id as CardId].name}</option>)}
            </select>

            <select 
              className="w-full p-2 rounded-lg border border-slate-300 text-sm"
              value={selectedTake}
              onChange={(e) => setSelectedTake(e.target.value as CardId)}
              disabled={!selectedTarget}
            >
              <option value="">3. Carte à prendre</option>
              {targetCards.map(([id]) => <option key={id} value={id}>{CARDS[id as CardId].name}</option>)}
            </select>

            <button
              onClick={() => {
                if (selectedTarget && selectedGive && selectedTake) {
                  setGameState(resolvePurpleAction(gameState, 0, selectedTarget, selectedGive as CardId, selectedTake as CardId));
                  setSelectedTarget('');
                  setSelectedGive('');
                  setSelectedTake('');
                }
              }}
              disabled={!selectedTarget || !selectedGive || !selectedTake}
              className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm mt-4"
            >
              Échanger
            </button>
          </div>
        );
      }
      return null;
    }

    case TurnState.BUY_PHASE:
      return (
        <div className="space-y-4">
          {renderDiceResult()}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center mb-4">
            <p className="text-indigo-800 font-medium">Phase d'achat</p>
            <p className="text-sm text-indigo-600">Sélectionnez une carte ou un monument dans la réserve.</p>
          </div>
          
          <button
            onClick={() => setGameState(endTurn(gameState))}
            className="w-full bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl hover:bg-slate-300 transition-colors shadow-sm"
          >
            Ne rien acheter (Fin du tour)
          </button>
        </div>
      );

    default:
      return null;
  }
};

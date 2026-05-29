import React, { useState } from 'react';
import { GameState, TurnState, MonumentId, CardId } from '../game/types';
import { rollDice, rerollDice, endTurn } from '../game/engine';
import { CARDS } from '../game/cards';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center backdrop-blur-md"
      >
        <Icons.Trophy className="mx-auto text-emerald-400 mb-2 drop-shadow-md" size={48} />
        <h3 className="text-xl font-bold text-emerald-300 mb-1 tracking-tight">{gameState.players.find(p => p.id === gameState.winner)?.name} a gagné !</h3>
        <p className="text-sm text-emerald-400/80">Tous les monuments ont été construits.</p>
      </motion.div>
    );
  }

  if (isAI) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 text-center flex flex-col items-center justify-center backdrop-blur-sm"
      >
        <Icons.Bot className="text-blue-400 mb-3 animate-bounce drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" size={32} />
        <p className="text-slate-300 font-medium">L'IA réfléchit...</p>
      </motion.div>
    );
  }

  const renderDiceResult = () => {
    if (gameState.diceResult.length === 0) return null;
    return (
      <div className="flex justify-center gap-4 mb-6">
        <AnimatePresence>
          {gameState.diceResult.map((val, i) => (
            <motion.div 
              key={`${i}-${val}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-16 h-16 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),0_0_15px_rgba(255,255,255,0.05)] flex items-center justify-center text-3xl font-bold text-white"
            >
              {val}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  switch (gameState.turnState) {
    case TurnState.START_TURN:
    case TurnState.CHOOSE_DICE: {
      const canRollTwo = activePlayer.monuments[MonumentId.GARE];
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-center text-slate-300 font-medium mb-4">Combien de dés voulez-vous lancer ?</p>
          <button
            onClick={() => setGameState(rollDice(gameState, 1))}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
          >
            <Icons.Dices size={20} />
            Lancer 1 dé
          </button>
          
          {canRollTwo && (
            <button
              onClick={() => setGameState(rollDice(gameState, 2))}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
            >
              <Icons.Dices size={20} />
              Lancer 2 dés
            </button>
          )}
        </motion.div>
      );
    }

    case TurnState.OPTIONAL_REROLL:
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {renderDiceResult()}
          <p className="text-center text-slate-300 font-medium mb-4">Voulez-vous relancer les dés (Musée des Confluences) ?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setGameState(rerollDice(gameState, true))}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              Oui, relancer
            </button>
            <button
              onClick={() => setGameState(rerollDice(gameState, false))}
              className="flex-1 bg-white/10 text-slate-200 font-semibold py-3 rounded-xl hover:bg-white/20 transition-all border border-white/10"
            >
              Non, garder
            </button>
          </div>
        </motion.div>
      );

    case TurnState.PURPLE_ACTION: {
      // No purple actions require targeting in the new set
      return null;
    }

    case TurnState.BUY_PHASE:
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {renderDiceResult()}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center mb-4 backdrop-blur-sm">
            <p className="text-blue-300 font-medium tracking-tight">Phase d'achat</p>
            <p className="text-sm text-blue-400/80">Sélectionnez une carte ou un monument dans la réserve.</p>
          </div>
          
          <button
            onClick={() => setGameState(endTurn(gameState))}
            className="w-full bg-white/5 text-slate-300 font-semibold py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/10"
          >
            Ne rien acheter (Fin du tour)
          </button>
        </motion.div>
      );

    default:
      return null;
  }
};

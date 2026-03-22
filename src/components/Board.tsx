import React from 'react';
import { GameState, TurnState } from '../game/types';
import { PlayerArea } from './PlayerArea';
import { Supply } from './Supply';
import { Controls } from './Controls';
import { Log } from './Log';

interface BoardProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

export const Board: React.FC<BoardProps> = ({ gameState, setGameState }) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-6">
        {/* Opponents */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {gameState.players.map((player, index) => {
            if (index === gameState.currentPlayerIndex) return null;
            return <PlayerArea key={player.id} player={player} isActive={false} />;
          })}
        </div>

        {/* Supply */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 flex-1 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Réserve</h2>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm ${(gameState.globalWarming || 0) >= 1.95 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
              <span className="text-lg">🌡️</span>
              <span>RC: {(gameState.globalWarming || 0).toFixed(1)}°C</span>
            </div>
          </div>
          <Supply gameState={gameState} setGameState={setGameState} />
        </div>

        {/* Active Player */}
        <div className="mt-auto">
          <PlayerArea player={activePlayer} isActive={true} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-10">
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Tour de {activePlayer.name}</h2>
          
          <Controls gameState={gameState} setGameState={setGameState} />
          
          <div className="mt-8 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Historique</h3>
            <Log logs={gameState.logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

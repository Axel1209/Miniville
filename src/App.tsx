import React, { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { SetupScreen } from './components/SetupScreen';
import { playAITurn } from './game/ai';
import { createInitialState } from './game/engine';
import { GameState } from './game/types';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('miniville_save');
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }
  }, []);

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('miniville_save', JSON.stringify(gameState));
      
      // Trigger AI turn if it's AI's turn
      const activePlayer = gameState.players[gameState.currentPlayerIndex];
      if (activePlayer.isAI && !gameState.winner) {
        const timeout = setTimeout(() => {
          setGameState(playAITurn(gameState));
        }, 1000); // 1 second delay for AI to make it visible
        return () => clearTimeout(timeout);
      }
    }
  }, [gameState]);

  const handleStartGame = (players: string[], aiCount: number) => {
    setGameState(createInitialState(players, aiCount));
  };

  const handleReset = () => {
    setIsConfirmingReset(true);
  };

  const confirmReset = () => {
    localStorage.removeItem('miniville_save');
    setGameState(null);
    setIsConfirmingReset(false);
  };

  const cancelReset = () => {
    setIsConfirmingReset(false);
  };

  if (!gameState) {
    return <SetupScreen onStart={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col relative">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
        <h1 className="text-2xl font-bold text-indigo-600">Miniville</h1>
        <button 
          onClick={handleReset}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          Recommencer
        </button>
      </header>
      
      <main className="flex-1 overflow-hidden relative z-0">
        <Board gameState={gameState} setGameState={setGameState} />
      </main>

      {isConfirmingReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Recommencer la partie ?</h2>
            <p className="text-slate-600 mb-6 text-sm">Êtes-vous sûr de vouloir recommencer ? Toute votre progression sera perdue.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelReset}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={confirmReset}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Recommencer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

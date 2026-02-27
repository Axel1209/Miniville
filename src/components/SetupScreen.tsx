import React, { useState } from 'react';

interface SetupScreenProps {
  onStart: (players: string[], aiCount: number) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [playerCount, setPlayerCount] = useState(1);
  const [aiCount, setAiCount] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>(['Joueur 1']);

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
    setPlayerNames(Array.from({ length: count }, (_, i) => playerNames[i] || `Joueur ${i + 1}`));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">Miniville</h1>
        
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre de joueurs humains ({playerCount})
            </label>
            <input 
              type="range" 
              min="1" 
              max="4" 
              value={playerCount} 
              onChange={(e) => handlePlayerCountChange(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="space-y-3">
            {playerNames.map((name, i) => (
              <div key={i}>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Nom du Joueur {i + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre d'IA ({aiCount})
            </label>
            <input 
              type="range" 
              min="0" 
              max={4 - playerCount} 
              value={aiCount} 
              onChange={(e) => setAiCount(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
              disabled={playerCount === 4}
            />
            <p className="text-xs text-slate-500 mt-1">
              Total de joueurs : {playerCount + aiCount} (max 4)
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            Lancer la partie
          </button>
        </form>
      </div>
    </div>
  );
};

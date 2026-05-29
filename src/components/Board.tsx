import React, { useState } from 'react';
import { GameState } from '../game/types';
import { PlayerArea } from './PlayerArea';
import { Supply } from './Supply';
import { Controls } from './Controls';
import { Log } from './Log';
import { Chat } from './Chat';
import { apiSendChat } from '../game/supabase';
import { motion } from 'motion/react';
import { MessageSquare, ScrollText, Radio, Hourglass } from 'lucide-react';

interface BoardProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onlineContext?: {
    myPlayerId: string;
    roomCode: string;
    roomChat: any[];
    playersList: any[];
  };
}

export const Board: React.FC<BoardProps> = ({ gameState, setGameState, onlineContext }) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  
  // Tabs for the sidebar: 'logs' or 'chat'
  const [activeTab, setActiveTab] = useState<'logs' | 'chat'>('logs');

  // Verify if it is my turn in online mode
  const isOnline = !!gameState.isOnline;
  const isMyTurn = !isOnline || (isOnline && activePlayer.id === onlineContext?.myPlayerId);
  const myPlayerName = isOnline && onlineContext
    ? onlineContext.playersList.find(p => p.id === onlineContext.myPlayerId)?.name || 'Moi'
    : 'Moi';

  // Guard state updates: only allow the player whose turn it is to make actions
  const handleSetGameState = (newState: GameState) => {
    if (isOnline && !isMyTurn) {
      console.warn("[Miniville Multi] Action blocked: It's not your turn!");
      return;
    }
    setGameState(newState);
  };

  const handleSendChat = (text: string) => {
    if (isOnline && onlineContext) {
      apiSendChat(onlineContext.roomCode, myPlayerName, text);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-6">
        {/* All Players */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-2"
        >
          {gameState.players.map((player, index) => {
            // Find connection status in online list
            const onlinePlayer = onlineContext?.playersList.find(p => p.id === player.id);
            const isConnected = onlinePlayer ? onlinePlayer.isConnected : true;

            return (
              <PlayerArea 
                key={player.id} 
                player={player} 
                isActive={index === gameState.currentPlayerIndex}
                isOnlineMode={isOnline}
                isConnected={isConnected}
              />
            );
          })}
        </motion.div>

        {/* Supply */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-4 flex-1 relative transition-opacity duration-300
            ${isOnline && !isMyTurn ? 'opacity-85' : 'opacity-100'}
          `}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              Réserve
              {isOnline && !isMyTurn && (
                <span className="text-[10px] bg-slate-500/10 border border-white/5 text-slate-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Visualisation seule
                </span>
              )}
            </h2>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm border ${(gameState.globalWarming || 0) >= 1.95 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
              <span className="text-lg">🌡️</span>
              <span>RC: {(gameState.globalWarming || 0).toFixed(1)}°C</span>
            </div>
          </div>
          <Supply 
            gameState={gameState} 
            setGameState={handleSetGameState} 
            isMyTurn={isMyTurn} // Pass isMyTurn to disable clicks visually
          />
        </motion.div>
      </div>

      {/* Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full md:w-80 bg-[rgba(2,6,23,0.7)] backdrop-blur-xl border-l border-white/10 flex flex-col h-full shadow-2xl z-10"
      >
        <div className="p-5 flex-1 flex flex-col overflow-hidden h-full">
          {/* Header turn info */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              Tour en cours
              {isOnline && isMyTurn && (
                <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  C'est votre tour !
                </span>
              )}
            </h2>
            <div className="text-lg font-bold text-blue-400 tracking-tight drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] truncate flex items-center gap-2">
              {isOnline && isMyTurn ? '👉 Votre Tour' : `👤 ${activePlayer.name}`}
            </div>
          </div>
          
          {/* Controls Guard */}
          <div className="mb-4">
            {isMyTurn ? (
              <Controls gameState={gameState} setGameState={handleSetGameState} />
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-500/5 border border-white/5 rounded-xl p-5 text-center flex flex-col items-center justify-center backdrop-blur-sm"
              >
                <Hourglass className="text-blue-400/70 mb-3 animate-spin duration-3000 drop-shadow-[0_0_5px_rgba(59,130,246,0.2)]" size={28} />
                <p className="text-xs text-slate-300 font-medium">En attente de l'action de</p>
                <p className="text-sm font-bold text-white mt-1">{activePlayer.name}</p>
              </motion.div>
            )}
          </div>
          
          {/* Tabs header */}
          <div className="flex border-b border-white/10 mb-4 shrink-0">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer
                ${activeTab === 'logs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}
              `}
            >
              <ScrollText size={14} />
              <span>Log</span>
            </button>
            {isOnline && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer relative
                  ${activeTab === 'chat' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}
                `}
              >
                <MessageSquare size={14} />
                <span>Tchat</span>
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'logs' ? (
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex-1 overflow-hidden flex flex-col">
                <Log logs={gameState.logs} />
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <Chat
                  chatList={onlineContext?.roomChat || []}
                  myPlayerName={myPlayerName}
                  onSendMessage={handleSendChat}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

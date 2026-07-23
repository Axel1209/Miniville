import React, { useEffect, useState, useRef } from 'react';
import { Board } from './components/Board';
import { SetupScreen } from './components/SetupScreen';
import { RulesModal } from './components/RulesModal';
import { OnlineScreen } from './components/OnlineScreen';
import { AuthModal } from './components/AuthModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { playAITurn } from './game/ai';
import { createInitialState } from './game/engine';
import { GameState } from './game/types';
import { 
  apiSetPlayerStatus, 
  apiUpdateGameState, 
  apiSubscribeToRoom 
} from './game/supabase';
import { getCurrentUser, recordGameResult, UserProfile } from './game/auth';
import { BookOpen, LogOut, Radio, Trophy, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [showRules, setShowRules] = useState(() => {
    return !localStorage.getItem('minivilles_eco_rules_seen');
  });

  // Auth & Leaderboard States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const recordedGameRef = useRef<string | null>(null);

  // Online Multiplayer States
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomChat, setRoomChat] = useState<any[]>([]);
  const [playersList, setPlayersList] = useState<any[]>([]);

  const handleCloseRules = () => {
    localStorage.setItem('minivilles_eco_rules_seen', 'true');
    setShowRules(false);
  };

  // --- LOCAL SAVE & AI TRIGGER EFFECT ---
  useEffect(() => {
    if (!isOnlineMode) {
      const saved = localStorage.getItem('miniville_save');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.isOnline) {
            setGameState(parsed);
          }
        } catch (e) {
          console.error('Failed to load save', e);
        }
      }
    }
  }, [isOnlineMode]);

  useEffect(() => {
    if (gameState) {
      if (!gameState.isOnline) {
        localStorage.setItem('miniville_save', JSON.stringify(gameState));
        
        const activePlayer = gameState.players[gameState.currentPlayerIndex];
        if (activePlayer.isAI && !gameState.winner) {
          const timeout = setTimeout(() => {
            setGameState(playAITurn(gameState));
          }, 1000);
          return () => clearTimeout(timeout);
        }
      }

      // --- RECORD GAME RESULT WHEN WINNER DECLARED ---
      if (gameState.winner && recordedGameRef.current !== `${gameState.winner}_${gameState.players.length}`) {
        recordedGameRef.current = `${gameState.winner}_${gameState.players.length}`;
        const winnerPlayer = gameState.players.find(p => p.id === gameState.winner);
        if (winnerPlayer) {
          const isGroupMode = gameState.isOnline || gameState.players.filter(p => !p.isAI).length > 1;
          const playerList = gameState.players.map(p => ({ name: p.name, isAI: p.isAI }));
          recordGameResult(playerList, winnerPlayer.name, isGroupMode);
        }
      }
    }
  }, [gameState]);

  // --- ONLINE SUBSCRIPTION EFFECT ---
  useEffect(() => {
    if (!isOnlineMode || !roomCode || !gameState?.isOnline) return;

    const unsubscribe = apiSubscribeToRoom(roomCode, (roomData) => {
      if (roomData.game_state) {
        setGameState(roomData.game_state);
      }
      if (roomData.chat) {
        setRoomChat(roomData.chat);
      }
      if (roomData.players) {
        setPlayersList(roomData.players);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOnlineMode, roomCode, gameState?.isOnline]);

  // --- ONLINE STATUS TRACKER EFFECT ---
  useEffect(() => {
    if (!gameState?.isOnline || !roomCode || !myPlayerId) return;

    apiSetPlayerStatus(roomCode, myPlayerId, true);

    const handleBeforeUnload = () => {
      apiSetPlayerStatus(roomCode, myPlayerId, false);
    };

    const handleVisibilityChange = () => {
      const isConnected = document.visibilityState === 'visible';
      apiSetPlayerStatus(roomCode, myPlayerId, isConnected);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      apiSetPlayerStatus(roomCode, myPlayerId, false);
    };
  }, [gameState?.isOnline, roomCode, myPlayerId]);

  const handleStartGame = (players: string[], aiCount: number) => {
    recordedGameRef.current = null;
    setGameState(createInitialState(players, aiCount));
  };

  const handleOnlineGameStarted = (onlineState: GameState, pId: string, code: string) => {
    recordedGameRef.current = null;
    setMyPlayerId(pId);
    setRoomCode(code);
    setIsOnlineMode(true);
    setGameState(onlineState);
  };

  const handleSetGameState = (newState: GameState) => {
    setGameState(newState);
    if (newState.isOnline && roomCode) {
      apiUpdateGameState(roomCode, newState);
    }
  };

  const handleReset = () => {
    setIsConfirmingReset(true);
  };

  const confirmReset = () => {
    recordedGameRef.current = null;
    if (gameState?.isOnline && roomCode) {
      apiSetPlayerStatus(roomCode, myPlayerId, false);
      setGameState(null);
      setIsOnlineMode(false);
      setRoomCode('');
      setRoomChat([]);
      setPlayersList([]);
    } else {
      localStorage.removeItem('miniville_save');
      setGameState(null);
    }
    setIsConfirmingReset(false);
  };

  const cancelReset = () => {
    setIsConfirmingReset(false);
  };

  // Render Online Lobby choice Screen
  if (isOnlineMode && !gameState) {
    return (
      <>
        <OnlineScreen onBack={() => setIsOnlineMode(false)} onGameStarted={handleOnlineGameStarted} />
        {showRules && <RulesModal onClose={handleCloseRules} />}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onUserChanged={(u) => setCurrentUser(u)} 
          />
        )}
        {showLeaderboardModal && (
          <LeaderboardModal 
            onClose={() => setShowLeaderboardModal(false)} 
            onOpenAuth={() => { setShowLeaderboardModal(false); setShowAuthModal(true); }}
          />
        )}
      </>
    );
  }

  // Render standard offline Setup Screen
  if (!gameState) {
    return (
      <>
        <SetupScreen 
          onStart={handleStartGame} 
          onShowRules={() => setShowRules(true)} 
          onPlayOnline={() => setIsOnlineMode(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          currentUser={currentUser}
        />
        {showRules && <RulesModal onClose={handleCloseRules} />}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onUserChanged={(u) => setCurrentUser(u)} 
          />
        )}
        {showLeaderboardModal && (
          <LeaderboardModal 
            onClose={() => setShowLeaderboardModal(false)} 
            onOpenAuth={() => { setShowLeaderboardModal(false); setShowAuthModal(true); }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200 font-sans flex flex-col relative">
      <header className="backdrop-blur-md bg-white/5 border-b border-white/10 p-4 flex justify-between items-center z-10 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] tracking-tight">Miniville</h1>
          {gameState.isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              <Radio size={12} className="animate-pulse" />
              <span>Salon : {roomCode}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 hover:bg-white/10 rounded-md transition-colors border border-emerald-500/20"
          >
            <User size={15} />
            <span>{currentUser ? currentUser.username : 'Compte'}</span>
          </button>

          <button 
            onClick={() => setShowLeaderboardModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-white/10 rounded-md transition-colors border border-amber-500/20"
          >
            <Trophy size={15} className="text-amber-400" />
            <span>Scores</span>
          </button>

          <button 
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300 hover:text-blue-200 hover:bg-white/10 rounded-md transition-colors border border-blue-500/20"
          >
            <BookOpen size={15} />
            <span>Règles</span>
          </button>

          <button 
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:bg-white/10 rounded-md transition-colors cursor-pointer border border-red-500/20"
          >
            {gameState.isOnline ? (
              <>
                <LogOut size={15} />
                <span>Quitter</span>
              </>
            ) : (
              <span>Recommencer</span>
            )}
          </button>
        </div>
      </header>
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden relative z-0"
      >
        <Board 
          gameState={gameState} 
          setGameState={handleSetGameState}
          onlineContext={{
            myPlayerId,
            roomCode,
            roomChat,
            playersList,
          }}
        />
      </motion.main>

      {showRules && <RulesModal onClose={handleCloseRules} />}
      
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onUserChanged={(u) => setCurrentUser(u)} 
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal 
          onClose={() => setShowLeaderboardModal(false)} 
          onOpenAuth={() => { setShowLeaderboardModal(false); setShowAuthModal(true); }}
        />
      )}

      {isConfirmingReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h2 className="text-lg font-bold text-white mb-2 tracking-tight">
              {gameState.isOnline ? 'Quitter la partie en ligne ?' : 'Recommencer la partie ?'}
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
              {gameState.isOnline 
                ? 'Êtes-vous sûr de vouloir quitter le salon ? La partie continuera pour les autres joueurs.'
                : 'Êtes-vous sûr de vouloir recommencer ? Toute votre progression sera perdue.'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelReset}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={confirmReset}
                className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-colors shadow-[0_0_10px_rgba(239,68,68,0.1)]"
              >
                {gameState.isOnline ? 'Quitter' : 'Recommencer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

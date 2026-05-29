import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Plus, Users, Share2, Play, Check, 
  AlertCircle, Database, Sparkles, MessageSquare, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  apiCreateRoom, apiJoinRoom, apiStartGame, apiSendChat, 
  apiSubscribeToRoom, isSupabaseConfigured, RoomData 
} from '../game/supabase';
import { Chat } from './Chat';
import { createInitialState } from '../game/engine';

interface OnlineScreenProps {
  onBack: () => void;
  onGameStarted: (gameState: any, myPlayerId: string, roomCode: string) => void;
}

export const OnlineScreen: React.FC<OnlineScreenProps> = ({ onBack, onGameStarted }) => {
  // Local Profile Setup
  const [nickname, setNickname] = useState(() => {
    // Read from sessionStorage first (for multi-tab simulation), fallback to localStorage
    return sessionStorage.getItem('miniville_nickname') || localStorage.getItem('miniville_nickname') || '';
  });
  const [tempNickname, setTempNickname] = useState(nickname);
  const [playerId] = useState(() => {
    // For simulation to work on two normal tabs of the same browser,
    // we use sessionStorage for player ID so each tab gets a unique player!
    let id = sessionStorage.getItem('miniville_player_id');
    if (!id) {
      id = `usr_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('miniville_player_id', id);
    }
    return id;
  });

  // Room status
  const [inRoom, setInRoom] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [joinCode, setJoinCode] = useState('');
  
  // UI states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Subscribe to room changes when inside a room
  useEffect(() => {
    if (!inRoom || !roomData?.code) return;

    const unsubscribe = apiSubscribeToRoom(roomData.code, (data) => {
      setRoomData(data);
      
      // If host started the game, transition to Board screen
      if (data.status === 'playing' && data.game_state) {
        onGameStarted(data.game_state, playerId, data.code);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [inRoom, roomData?.code]);

  // Handle Nickname Save
  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempNickname.trim()) {
      sessionStorage.setItem('miniville_nickname', tempNickname.trim());
      localStorage.setItem('miniville_nickname', tempNickname.trim());
      setNickname(tempNickname.trim());
    }
  };

  // Create Room Action
  const handleCreateRoom = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiCreateRoom(playerId, nickname);
      setRoomData(data);
      setInRoom(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de créer le salon.');
    } finally {
      setLoading(false);
    }
  };

  // Join Room Action
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiJoinRoom(joinCode, playerId, nickname);
      setRoomData(data);
      setInRoom(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de rejoindre le salon. Vérifiez le code.");
    } finally {
      setLoading(false);
    }
  };

  // Start Game Action (Host only)
  const handleStartGame = async () => {
    if (!roomData) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Extract active player names
      const sortedPlayers = [...roomData.players];
      const playerNames = sortedPlayers.map(p => p.name);
      
      // Create initial local game state
      const initialLocalState = createInitialState(playerNames, 0); // No AI in online mode

      // Map local p0, p1... player IDs to Supabase player IDs
      const mappedPlayers = initialLocalState.players.map((p, idx) => ({
        ...p,
        id: sortedPlayers[idx].id, // Replace p0, p1 with actual supabase player IDs
      }));

      const onlineGameState = {
        ...initialLocalState,
        players: mappedPlayers,
        currentPlayerIndex: 0,
        isOnline: true,
        roomCode: roomData.code,
        myPlayerId: playerId,
        hostId: roomData.host_id,
        playersList: sortedPlayers,
        onlineStatus: 'playing' as const,
      };

      await apiStartGame(roomData.code, onlineGameState);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors du lancement de la partie.');
      setLoading(false);
    }
  };

  // Leave room action
  const handleLeaveRoom = () => {
    setInRoom(false);
    setRoomData(null);
    setJoinCode('');
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!roomData) return;
    navigator.clipboard.writeText(roomData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat message sending
  const handleSendChat = (text: string) => {
    if (!roomData) return;
    apiSendChat(roomData.code, nickname, text);
  };

  // Render Nickname Setup Screen if nickname is missing
  if (!nickname) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
            <Sparkles className="text-blue-400" size={20} />
            Choix du Pseudonyme
          </h2>
          <p className="text-slate-400 text-xs mb-6">Veuillez entrer le pseudonyme avec lequel vous souhaitez apparaître en ligne.</p>
          
          <form onSubmit={handleSaveNickname} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Votre pseudo</label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                maxLength={15}
                required
                placeholder="Ex: Axel"
                className="w-full px-4 py-2.5 bg-black/35 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 transition-all"
              >
                Retour
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-2.5 rounded-xl border border-blue-400/30 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                Confirmer
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      {/* Top Left Back Button */}
      {!inRoom && (
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all backdrop-blur-md"
        >
          <ArrowLeft size={16} />
          <span>Menu</span>
        </button>
      )}

      {/* Database/Mode status indicator */}
      {!inRoom && (
        <div className="absolute top-4 right-4 flex flex-col items-end">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
              <Database size={12} />
              <span>Supabase Cloud Connecté 🌐</span>
            </div>
          ) : (
            <button
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-semibold text-yellow-400 hover:bg-yellow-500/20 transition-all cursor-pointer shadow-[0_0_10px_rgba(234,179,8,0.1)]"
            >
              <Database size={12} className="animate-pulse" />
              <span>Mode Simulation Activé 🧪 (Configurer ?)</span>
            </button>
          )}
        </div>
      )}

      <div className="w-full max-w-4xl flex flex-col items-center py-8">
        
        {/* Dynamic setup guide for Supabase */}
        {!inRoom && !isSupabaseConfigured && showSetupGuide && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mb-6 bg-[#0f172a]/95 border border-yellow-500/20 rounded-2xl p-5 shadow-2xl backdrop-blur-xl"
          >
            <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Database size={16} />
              Guide : Connecter Supabase (100% Gratuit)
            </h3>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed mb-4">
              <li>Créez un compte gratuit sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300">supabase.com</a>.</li>
              <li>Créez un nouveau projet (ex: <code className="text-slate-400">Miniville-Multi</code>).</li>
              <li>Allez dans le <strong>SQL Editor</strong> de Supabase et exécutez le script suivant :</li>
            </ol>
            <pre className="bg-black/40 border border-white/5 p-2 rounded text-[10px] text-slate-400 overflow-x-auto mb-4 select-all font-mono leading-tight">
{`CREATE TABLE miniville_rooms (
  code text PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT null,
  status text NOT null,
  host_id text NOT null,
  players jsonb NOT null,
  game_state jsonb,
  chat jsonb DEFAULT '[]'::jsonb NOT null,
  last_update timestamptz DEFAULT now() NOT null
);

ALTER PUBLICATION supabase_realtime ADD TABLE miniville_rooms;`}
            </pre>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed mb-4 start-4">
              <li>Copiez votre <strong>URL</strong> et votre <strong>Anon Key</strong> dans les paramètres du projet API.</li>
              <li>Créez un fichier <code className="text-slate-400">.env</code> à la racine du dossier Miniville et écrivez :</li>
            </ol>
            <pre className="bg-black/40 border border-white/5 p-2 rounded text-[10px] text-slate-400 overflow-x-auto select-all font-mono leading-tight">
{`VITE_SUPABASE_URL=VOTRE_URL_PROJET_ICI
VITE_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_ICI`}
            </pre>
            <p className="text-[10px] text-slate-400 italic">
              🧪 <strong>Comment tester la simulation locale ?</strong> Ouvrez simplement deux fenêtres/onglets de navigateur distincts à l'adresse <strong>http://localhost:3000</strong>. L'application transmettra les données d'un onglet à l'autre via les API Broadcast natives de votre navigateur !
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!inRoom ? (
            /* ================= OUTER MENU (LOBBY CHOICE) ================= */
            <motion.div 
              key="outer_menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#0f172a]/90 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full backdrop-blur-xl"
            >
              <h1 className="text-3xl font-extrabold text-center text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] tracking-tight mb-2">
                Miniville en Ligne
              </h1>
              <p className="text-center text-slate-400 text-xs mb-8 flex items-center justify-center gap-1.5">
                Joueur : <span className="font-semibold text-blue-300">{nickname}</span>
                <button 
                  onClick={() => setNickname('')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  (Changer)
                </button>
              </p>

              {errorMsg && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Create room card */}
                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full p-4 rounded-xl border border-blue-500/20 hover:border-blue-400/40 bg-blue-500/5 hover:bg-blue-500/10 text-left transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                      <Plus size={16} />
                      Créer un Salon
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Créez une salle et invitez vos amis à vous rejoindre.
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    <Plus size={18} />
                  </div>
                </button>

                {/* Separator */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <span className="relative px-3 bg-[#0f172a] text-xs font-semibold text-slate-500 uppercase tracking-widest">Ou</span>
                </div>

                {/* Join room card */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/3 flex flex-col gap-3">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Users size={16} className="text-blue-400" />
                      Rejoindre un Salon
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Entrez le code à 4 lettres du salon de votre ami.
                    </div>
                  </div>

                  <form onSubmit={handleJoinRoom} className="flex gap-2 mt-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="CODE"
                      required
                      className="flex-1 text-center font-bold tracking-[0.25em] text-sm uppercase px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                      type="submit"
                      disabled={loading || joinCode.length < 4}
                      className="px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed border border-blue-400/30 text-white font-semibold rounded-lg text-xs transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                    >
                      Rejoindre
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================= ROOM LOBBY (WAITING ROOM) ================= */
            <motion.div 
              key="room_lobby"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-[#0f172a]/90 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-3xl flex flex-col md:flex-row gap-6 backdrop-blur-xl relative"
            >
              {/* Left Panel: Lobby details and player list */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    Salon de jeu en ligne
                    {!isSupabaseConfigured && <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Simulation</span>}
                  </h2>
                  
                  {/* Giant Room Code Display */}
                  <div className="flex items-center gap-3 mb-6 mt-1">
                    <span className="text-4xl font-extrabold text-white tracking-widest select-all drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      {roomData?.code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Copier le code"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                      <Share2 size={10} />
                      Partager ce code
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Player list */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Joueurs connectés ({roomData?.players.length}/4)
                    </h3>
                    
                    <div className="space-y-2">
                      {roomData?.players.map((p) => {
                        const isMe = p.id === playerId;
                        return (
                          <div 
                            key={p.id}
                            className={`p-3 rounded-xl border flex items-center justify-between backdrop-blur-md transition-all
                              ${isMe ? 'bg-blue-500/5 border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'bg-black/20 border-white/5 text-slate-200'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              {/* Connection Dot */}
                              <div className={`w-2.5 h-2.5 rounded-full ${p.isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                              <span className="text-sm font-semibold select-text">
                                {p.name} {isMe && <span className="text-[10px] font-normal text-blue-400">(Moi)</span>}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              {p.isHost && (
                                <span className="text-[9px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                  Hôte
                                </span>
                              )}
                              {!p.isConnected && (
                                <span className="text-[9px] bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                  Déconnecté
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Empty slots placeholders */}
                      {Array.from({ length: 4 - (roomData?.players.length || 0) }).map((_, i) => (
                        <div key={i} className="p-3 rounded-xl border border-dashed border-white/5 bg-transparent text-slate-600 flex items-center justify-center text-xs italic">
                          En attente d'un joueur...
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={handleLeaveRoom}
                    className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 transition-all cursor-pointer"
                  >
                    Quitter
                  </button>

                  {/* Start button for host, status text for clients */}
                  {roomData?.host_id === playerId ? (
                    <button
                      onClick={handleStartGame}
                      disabled={loading || (roomData?.players.length || 0) < 2}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed border border-blue-400/30 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play size={16} />
                      <span>Lancer la Partie</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 flex items-center justify-center gap-2 italic">
                      <AlertCircle size={14} className="animate-pulse text-blue-400" />
                      <span>En attente du lancement par l'hôte...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Active Chat Room */}
              <div className="w-full md:w-80 h-80 md:h-[400px] border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
                <Chat 
                  chatList={roomData?.chat || []}
                  myPlayerName={nickname}
                  onSendMessage={handleSendChat}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { GameState } from './types';

// Room database structure type
export interface RoomData {
  code: string;
  status: 'lobby' | 'playing' | 'finished';
  host_id: string;
  players: { id: string; name: string; isHost: boolean; isConnected: boolean }[];
  game_state: GameState | null;
  chat: { id: string; senderName: string; text: string; timestamp: number }[];
  last_update: string;
}

// Retrieve Supabase environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid (i.e. not empty and not placeholders)
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- SIMULATION MODE USING BROADCASTCHANNEL ---
// This allows testing the online multi-player experience locally in multiple tabs!
class SimulationServer {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, (room: RoomData) => void> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.channel = new BroadcastChannel('miniville_simulation_channel');
      this.channel.onmessage = (event) => {
        const { type, code } = event.data;
        if (type === 'ROOM_UPDATED') {
          const listener = this.listeners.get(code);
          if (listener) {
            const room = this.getLocalRoom(code);
            if (room) {
              listener(room);
            }
          }
        }
      };
    }
  }

  private getLocalRoom(code: string): RoomData | null {
    const raw = localStorage.getItem(`miniville_sim_room_${code}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private saveLocalRoom(room: RoomData) {
    localStorage.setItem(`miniville_sim_room_${room.code}`, JSON.stringify(room));
    this.channel?.postMessage({ type: 'ROOM_UPDATED', code: room.code });
  }

  createRoom(code: string, hostId: string, hostName: string): RoomData {
    const room: RoomData = {
      code,
      status: 'lobby',
      host_id: hostId,
      players: [{ id: hostId, name: hostName, isHost: true, isConnected: true }],
      game_state: null,
      chat: [
        {
          id: 'system_welcome',
          senderName: 'Système',
          text: `Bienvenue dans le salon ${code} ! Partagez ce code pour jouer à plusieurs.`,
          timestamp: Date.now(),
        },
      ],
      last_update: new Date().toISOString(),
    };
    this.saveLocalRoom(room);
    return room;
  }

  joinRoom(code: string, playerId: string, playerName: string): RoomData {
    const room = this.getLocalRoom(code);
    if (!room) throw new Error("Le salon n'existe pas.");
    
    if (room.players.length >= 4 && !room.players.some(p => p.id === playerId)) {
      throw new Error('Le salon est déjà complet (maximum 4 joueurs).');
    }

    const existingIdx = room.players.findIndex((p) => p.id === playerId);
    if (existingIdx >= 0) {
      room.players[existingIdx].isConnected = true;
      room.players[existingIdx].name = playerName; // update nickname if changed
    } else {
      room.players.push({
        id: playerId,
        name: playerName,
        isHost: false,
        isConnected: true,
      });
      room.chat.push({
        id: `sys_join_${Date.now()}`,
        senderName: 'Système',
        text: `${playerName} a rejoint le salon.`,
        timestamp: Date.now(),
      });
    }

    room.last_update = new Date().toISOString();
    this.saveLocalRoom(room);
    return room;
  }

  leaveRoom(code: string, playerId: string) {
    const room = this.getLocalRoom(code);
    if (!room) return;

    const p = room.players.find((player) => player.id === playerId);
    if (p) {
      p.isConnected = false;
      room.last_update = new Date().toISOString();
      this.saveLocalRoom(room);
    }
  }

  startGame(code: string, initialState: GameState) {
    const room = this.getLocalRoom(code);
    if (!room) return;

    room.status = 'playing';
    room.game_state = {
      ...initialState,
      isOnline: true,
      roomCode: code,
      onlineStatus: 'playing',
    };
    room.last_update = new Date().toISOString();
    this.saveLocalRoom(room);
  }

  updateState(code: string, gameState: GameState) {
    const room = this.getLocalRoom(code);
    if (!room) return;

    room.game_state = gameState;
    room.status = gameState.winner ? 'finished' : 'playing';
    room.last_update = new Date().toISOString();
    this.saveLocalRoom(room);
  }

  sendChat(code: string, message: { senderName: string; text: string }) {
    const room = this.getLocalRoom(code);
    if (!room) return;

    room.chat.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      senderName: message.senderName,
      text: message.text,
      timestamp: Date.now(),
    });
    room.last_update = new Date().toISOString();
    this.saveLocalRoom(room);
  }

  subscribe(code: string, callback: (room: RoomData) => void): () => void {
    this.listeners.set(code, callback);
    // Initial call
    const room = this.getLocalRoom(code);
    if (room) {
      setTimeout(() => callback(room), 0);
    }

    return () => {
      this.listeners.delete(code);
    };
  }
}

export const simServer = new SimulationServer();

// --- API ACTIONS (SWAP BETWEEN REAL SUPABASE AND SIMULATION) ---

// Helper to generate a 4-letter room code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new room
export const apiCreateRoom = async (
  playerId: string,
  playerName: string
): Promise<RoomData> => {
  const code = generateRoomCode();
  
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Miniville Multi] Using simulation mode to create room:', code);
    return simServer.createRoom(code, playerId, playerName);
  }

  const room: RoomData = {
    code,
    status: 'lobby',
    host_id: playerId,
    players: [{ id: playerId, name: playerName, isHost: true, isConnected: true }],
    game_state: null,
    chat: [
      {
        id: 'system_welcome',
        senderName: 'Système',
        text: `Bienvenue dans le salon ${code} ! Partagez ce code pour jouer à plusieurs.`,
        timestamp: Date.now(),
      },
    ],
    last_update: new Date().toISOString(),
  };

  const { error } = await supabase.from('miniville_rooms').insert(room);
  if (error) {
    console.error('Supabase error creating room:', error);
    throw new Error('Impossible de créer le salon de jeu en ligne.');
  }

  return room;
};

// Join an existing room
export const apiJoinRoom = async (
  code: string,
  playerId: string,
  playerName: string
): Promise<RoomData> => {
  const cleanCode = code.trim().toUpperCase();
  
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Miniville Multi] Using simulation mode to join room:', cleanCode);
    return simServer.joinRoom(cleanCode, playerId, playerName);
  }

  // Fetch current room
  const { data: room, error: fetchError } = await supabase
    .from('miniville_rooms')
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle();

  if (fetchError || !room) {
    throw new Error("Le salon n'existe pas ou a expiré.");
  }

  const typedRoom = room as RoomData;

  if (typedRoom.players.length >= 4 && !typedRoom.players.some((p) => p.id === playerId)) {
    throw new Error('Le salon est déjà complet (maximum 4 joueurs).');
  }

  // Update players list
  const players = [...typedRoom.players];
  const existingIdx = players.findIndex((p) => p.id === playerId);
  
  if (existingIdx >= 0) {
    players[existingIdx].isConnected = true;
    players[existingIdx].name = playerName;
  } else {
    players.push({
      id: playerId,
      name: playerName,
      isHost: false,
      isConnected: true,
    });
  }

  // Append joining system message
  const chat = [...typedRoom.chat];
  if (existingIdx === -1) {
    chat.push({
      id: `sys_join_${Date.now()}`,
      senderName: 'Système',
      text: `${playerName} a rejoint le salon.`,
      timestamp: Date.now(),
    });
  }

  const { data: updatedRoom, error: updateError } = await supabase
    .from('miniville_rooms')
    .update({
      players,
      chat,
      last_update: new Date().toISOString(),
    })
    .eq('code', cleanCode)
    .select()
    .maybeSingle();

  if (updateError || !updatedRoom) {
    console.error('Supabase error joining room:', updateError);
    throw new Error('Impossible de rejoindre le salon.');
  }

  return updatedRoom as RoomData;
};

// Set player connected/disconnected
export const apiSetPlayerStatus = async (
  code: string,
  playerId: string,
  isConnected: boolean
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    if (!isConnected) simServer.leaveRoom(code, playerId);
    return;
  }

  // Fetch current room
  const { data: room } = await supabase
    .from('miniville_rooms')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (!room) return;

  const typedRoom = room as RoomData;
  const players = typedRoom.players.map((p) =>
    p.id === playerId ? { ...p, isConnected } : p
  );

  await supabase
    .from('miniville_rooms')
    .update({
      players,
      last_update: new Date().toISOString(),
    })
    .eq('code', code);
};

// Start the game inside a room
export const apiStartGame = async (
  code: string,
  initialState: GameState
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    simServer.startGame(code, initialState);
    return;
  }

  const { error } = await supabase
    .from('miniville_rooms')
    .update({
      status: 'playing',
      game_state: {
        ...initialState,
        isOnline: true,
        roomCode: code,
        onlineStatus: 'playing',
      },
      last_update: new Date().toISOString(),
    })
    .eq('code', code);

  if (error) {
    console.error('Supabase error starting game:', error);
    throw new Error("Erreur lors du lancement de la partie.");
  }
};

// Update active game state
export const apiUpdateGameState = async (
  code: string,
  nextState: GameState
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    simServer.updateState(code, nextState);
    return;
  }

  const { error } = await supabase
    .from('miniville_rooms')
    .update({
      game_state: nextState,
      status: nextState.winner ? 'finished' : 'playing',
      last_update: new Date().toISOString(),
    })
    .eq('code', code);

  if (error) {
    console.error('Supabase error updating state:', error);
  }
};

// Send a chat message
export const apiSendChat = async (
  code: string,
  senderName: string,
  text: string
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    simServer.sendChat(code, { senderName, text });
    return;
  }

  // Fetch current chat list to append
  const { data: room } = await supabase
    .from('miniville_rooms')
    .select('chat')
    .eq('code', code)
    .maybeSingle();

  if (!room) return;

  const currentChat = (room.chat || []) as any[];
  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    senderName,
    text,
    timestamp: Date.now(),
  };

  const { error } = await supabase
    .from('miniville_rooms')
    .update({
      chat: [...currentChat, newMsg],
      last_update: new Date().toISOString(),
    })
    .eq('code', code);

  if (error) {
    console.error('Supabase error sending chat:', error);
  }
};

// Subscribe in real-time to any changes on the room
export const apiSubscribeToRoom = (
  code: string,
  callback: (roomData: RoomData) => void
): (() => void) => {
  if (!isSupabaseConfigured || !supabase) {
    return simServer.subscribe(code, callback);
  }

  // Real Supabase subscription
  const channel = supabase
    .channel(`room_${code}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'miniville_rooms',
        filter: `code=eq.${code}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as RoomData);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Fetch initial data right after subscription starts
        supabase
          .from('miniville_rooms')
          .select('*')
          .eq('code', code)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              callback(data as RoomData);
            }
          });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

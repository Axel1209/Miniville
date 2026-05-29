export enum CardColor {
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  RED = 'RED',
  PURPLE = 'PURPLE',
}

export enum CardId {
  COMPOST = 'COMPOST',
  EXTRACTION_CAOUTCHOUC = 'EXTRACTION_CAOUTCHOUC',
  AMAP = 'AMAP',
  PEAGE_AUTOROUTE = 'PEAGE_AUTOROUTE',
  MAISON_AUTONOME = 'MAISON_AUTONOME',
  PUITS_PETROLE = 'PUITS_PETROLE',
  CENTRALE_NUCLEAIRE = 'CENTRALE_NUCLEAIRE',
  AEROPORT = 'AEROPORT',
  BIOCOOP = 'BIOCOOP',
  METHANISATION = 'METHANISATION',
  RAFFINERIE = 'RAFFINERIE',
  LE_SUN = 'LE_SUN',
  EOLIENNE = 'EOLIENNE',
  USINE_MICHELIN = 'USINE_MICHELIN',
  PANNEAUX_SOLAIRES = 'PANNEAUX_SOLAIRES',
}

export enum MonumentId {
  GARE = 'GARE',
  CENTRE_COMMERCIAL = 'CENTRE_COMMERCIAL',
  PARC_ATTRACTIONS = 'PARC_ATTRACTIONS',
  TOUR_RADIO = 'TOUR_RADIO',
}

export interface Card {
  id: CardId;
  name: string;
  cost: number;
  color: CardColor;
  activations: number[];
  icon: string;
  description: string;
  isRC?: boolean;
}

export interface Monument {
  id: MonumentId;
  name: string;
  cost: number;
  description: string;
  icon: string;
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  coins: number;
  cards: Record<CardId, number>; // Count of each card
  monuments: Record<MonumentId, boolean>; // True if built
  consecutiveNuclear: number;
}

export enum TurnState {
  START_TURN = 'START_TURN',
  CHOOSE_DICE = 'CHOOSE_DICE',
  ROLL_DICE = 'ROLL_DICE',
  OPTIONAL_REROLL = 'OPTIONAL_REROLL',
  ACTIVATE_RED = 'ACTIVATE_RED',
  ACTIVATE_BLUE = 'ACTIVATE_BLUE',
  ACTIVATE_GREEN = 'ACTIVATE_GREEN',
  ACTIVATE_PURPLE = 'ACTIVATE_PURPLE',
  PURPLE_ACTION = 'PURPLE_ACTION', // Waiting for user input for purple cards
  BUY_PHASE = 'BUY_PHASE',
  CHECK_WIN = 'CHECK_WIN',
  END_TURN = 'END_TURN',
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  turnState: TurnState;
  diceResult: number[];
  supply: Record<CardId, number>; // Count of available cards
  logs: string[];
  winner: string | null;
  hasRerolled: boolean;
  extraTurn: boolean;
  globalWarming: number;
  // Online Multiplayer Fields
  isOnline?: boolean;
  roomCode?: string;
  myPlayerId?: string;
  hostId?: string;
  playersList?: { id: string; name: string; isHost: boolean; isConnected: boolean }[];
  onlineStatus?: 'lobby' | 'playing' | 'finished';
}

export interface GameAction {
  type: string;
  payload?: any;
}

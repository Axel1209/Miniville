export enum CardColor {
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  RED = 'RED',
  PURPLE = 'PURPLE',
}

export enum CardId {
  CHAMP_DE_BLE = 'CHAMP_DE_BLE',
  FERME = 'FERME',
  FORET = 'FORET',
  MINE = 'MINE',
  VERGER = 'VERGER',
  BOULANGERIE = 'BOULANGERIE',
  SUPERETTE = 'SUPERETTE',
  FROMAGERIE = 'FROMAGERIE',
  FABRIQUE_DE_MEUBLES = 'FABRIQUE_DE_MEUBLES',
  MARCHE_FRUITS_LEGUMES = 'MARCHE_FRUITS_LEGUMES',
  CAFE = 'CAFE',
  RESTAURANT = 'RESTAURANT',
  STADE = 'STADE',
  CENTRE_AFFAIRES = 'CENTRE_AFFAIRES',
  CHAINE_TELEVISION = 'CHAINE_TELEVISION',
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
  pendingPurpleActions: PurpleAction[];
  hasRerolled: boolean;
  extraTurn: boolean;
}

export type PurpleActionType = 'TRADE_CARD' | 'STEAL_5';

export interface PurpleAction {
  type: PurpleActionType;
  sourcePlayerId: string;
}

export interface GameAction {
  type: string;
  payload?: any;
}

import { CARDS, INITIAL_SUPPLY, MONUMENTS } from './cards';
import { CardColor, CardId, GameState, MonumentId, Player, PurpleAction, TurnState } from './types';

export const createInitialState = (playerNames: string[], aiCount: number): GameState => {
  const players: Player[] = [];
  
  for (let i = 0; i < playerNames.length; i++) {
    players.push({
      id: `p${i}`,
      name: playerNames[i],
      isAI: false,
      coins: 3,
      cards: {
        [CardId.CHAMP_DE_BLE]: 1,
        [CardId.BOULANGERIE]: 1,
        [CardId.FERME]: 0,
        [CardId.FORET]: 0,
        [CardId.MINE]: 0,
        [CardId.VERGER]: 0,
        [CardId.SUPERETTE]: 0,
        [CardId.FROMAGERIE]: 0,
        [CardId.FABRIQUE_DE_MEUBLES]: 0,
        [CardId.MARCHE_FRUITS_LEGUMES]: 0,
        [CardId.CAFE]: 0,
        [CardId.RESTAURANT]: 0,
        [CardId.STADE]: 0,
        [CardId.CENTRE_AFFAIRES]: 0,
        [CardId.CHAINE_TELEVISION]: 0,
      },
      monuments: {
        [MonumentId.GARE]: false,
        [MonumentId.CENTRE_COMMERCIAL]: false,
        [MonumentId.PARC_ATTRACTIONS]: false,
        [MonumentId.TOUR_RADIO]: false,
      },
    });
  }

  for (let i = 0; i < aiCount; i++) {
    players.push({
      id: `ai${i}`,
      name: `IA ${i + 1}`,
      isAI: true,
      coins: 3,
      cards: {
        [CardId.CHAMP_DE_BLE]: 1,
        [CardId.BOULANGERIE]: 1,
        [CardId.FERME]: 0,
        [CardId.FORET]: 0,
        [CardId.MINE]: 0,
        [CardId.VERGER]: 0,
        [CardId.SUPERETTE]: 0,
        [CardId.FROMAGERIE]: 0,
        [CardId.FABRIQUE_DE_MEUBLES]: 0,
        [CardId.MARCHE_FRUITS_LEGUMES]: 0,
        [CardId.CAFE]: 0,
        [CardId.RESTAURANT]: 0,
        [CardId.STADE]: 0,
        [CardId.CENTRE_AFFAIRES]: 0,
        [CardId.CHAINE_TELEVISION]: 0,
      },
      monuments: {
        [MonumentId.GARE]: false,
        [MonumentId.CENTRE_COMMERCIAL]: false,
        [MonumentId.PARC_ATTRACTIONS]: false,
        [MonumentId.TOUR_RADIO]: false,
      },
    });
  }

  return {
    players,
    currentPlayerIndex: 0,
    turnState: TurnState.START_TURN,
    diceResult: [],
    supply: { ...INITIAL_SUPPLY },
    logs: ['La partie commence !'],
    winner: null,
    pendingPurpleActions: [],
    hasRerolled: false,
    extraTurn: false,
  };
};

export const rollDice = (state: GameState, numDice: number): GameState => {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = numDice === 2 ? Math.floor(Math.random() * 6) + 1 : 0;
  const diceResult = numDice === 2 ? [dice1, dice2] : [dice1];
  
  const currentPlayer = state.players[state.currentPlayerIndex];
  const total = diceResult.reduce((a, b) => a + b, 0);
  
  let newState = {
    ...state,
    diceResult,
    logs: [...state.logs, `${currentPlayer.name} lance les dés et obtient ${total}.`],
  };

  if (currentPlayer.monuments[MonumentId.PARC_ATTRACTIONS] && numDice === 2 && dice1 === dice2) {
    newState.extraTurn = true;
    newState.logs.push(`${currentPlayer.name} a fait un double et rejouera !`);
  }

  if (currentPlayer.monuments[MonumentId.TOUR_RADIO] && !newState.hasRerolled) {
    newState.turnState = TurnState.OPTIONAL_REROLL;
  } else {
    newState = processActivations(newState);
  }

  return newState;
};

export const rerollDice = (state: GameState, doReroll: boolean): GameState => {
  if (!doReroll) {
    return processActivations({ ...state, hasRerolled: true });
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  let newState = {
    ...state,
    hasRerolled: true,
    extraTurn: false, // Reset extra turn on reroll
    logs: [...state.logs, `${currentPlayer.name} utilise la Tour Radio pour relancer.`],
  };

  return rollDice(newState, state.diceResult.length);
};

const processActivations = (state: GameState): GameState => {
  let newState = { ...state };
  const total = newState.diceResult.reduce((a, b) => a + b, 0);
  const activePlayer = newState.players[newState.currentPlayerIndex];

  // RED CARDS (Counter-clockwise from active player)
  for (let i = 1; i < newState.players.length; i++) {
    const targetIdx = (newState.currentPlayerIndex - i + newState.players.length) % newState.players.length;
    const targetPlayer = newState.players[targetIdx];
    
    // Cafe
    if (targetPlayer.cards[CardId.CAFE] > 0 && CARDS[CardId.CAFE].activations.includes(total)) {
      const amount = Math.min(activePlayer.coins, 1 * targetPlayer.cards[CardId.CAFE]);
      if (amount > 0) {
        activePlayer.coins -= amount;
        targetPlayer.coins += amount;
        newState.logs.push(`${targetPlayer.name} prend ${amount} pièce(s) à ${activePlayer.name} (Café).`);
      }
    }
    // Restaurant
    if (targetPlayer.cards[CardId.RESTAURANT] > 0 && CARDS[CardId.RESTAURANT].activations.includes(total)) {
      const amount = Math.min(activePlayer.coins, 2 * targetPlayer.cards[CardId.RESTAURANT]);
      if (amount > 0) {
        activePlayer.coins -= amount;
        targetPlayer.coins += amount;
        newState.logs.push(`${targetPlayer.name} prend ${amount} pièce(s) à ${activePlayer.name} (Restaurant).`);
      }
    }
  }

  // BLUE CARDS (All players)
  newState.players.forEach(player => {
    const blueCards = [CardId.CHAMP_DE_BLE, CardId.FERME, CardId.FORET, CardId.MINE, CardId.VERGER];
    blueCards.forEach(cardId => {
      if (player.cards[cardId] > 0 && CARDS[cardId].activations.includes(total)) {
        let gain = 0;
        if (cardId === CardId.CHAMP_DE_BLE) gain = 1;
        else if (cardId === CardId.FERME) gain = 1;
        else if (cardId === CardId.FORET) gain = 1;
        else if (cardId === CardId.MINE) gain = 5;
        else if (cardId === CardId.VERGER) gain = 3;
        
        const totalGain = gain * player.cards[cardId];
        player.coins += totalGain;
        newState.logs.push(`${player.name} gagne ${totalGain} pièce(s) avec ${CARDS[cardId].name}.`);
      }
    });
  });

  // GREEN CARDS (Active player only)
  const greenCards = [CardId.BOULANGERIE, CardId.SUPERETTE, CardId.FROMAGERIE, CardId.FABRIQUE_DE_MEUBLES, CardId.MARCHE_FRUITS_LEGUMES];
  greenCards.forEach(cardId => {
    if (activePlayer.cards[cardId] > 0 && CARDS[cardId].activations.includes(total)) {
      let gain = 0;
      const count = activePlayer.cards[cardId];
      const hasMall = activePlayer.monuments[MonumentId.CENTRE_COMMERCIAL];

      if (cardId === CardId.BOULANGERIE) gain = (1 + (hasMall ? 1 : 0)) * count;
      else if (cardId === CardId.SUPERETTE) gain = (3 + (hasMall ? 1 : 0)) * count;
      else if (cardId === CardId.FROMAGERIE) gain = 3 * activePlayer.cards[CardId.FERME] * count;
      else if (cardId === CardId.FABRIQUE_DE_MEUBLES) gain = 3 * (activePlayer.cards[CardId.FORET] + activePlayer.cards[CardId.MINE]) * count;
      else if (cardId === CardId.MARCHE_FRUITS_LEGUMES) gain = 2 * activePlayer.cards[CardId.VERGER] * count;

      if (gain > 0) {
        activePlayer.coins += gain;
        newState.logs.push(`${activePlayer.name} gagne ${gain} pièce(s) avec ${CARDS[cardId].name}.`);
      }
    }
  });

  // PURPLE CARDS (Active player only)
  const pendingActions: PurpleAction[] = [];
  
  if (activePlayer.cards[CardId.STADE] > 0 && CARDS[CardId.STADE].activations.includes(total)) {
    let totalGained = 0;
    newState.players.forEach(p => {
      if (p.id !== activePlayer.id) {
        const amount = Math.min(p.coins, 2);
        p.coins -= amount;
        totalGained += amount;
      }
    });
    if (totalGained > 0) {
      activePlayer.coins += totalGained;
      newState.logs.push(`${activePlayer.name} gagne ${totalGained} pièce(s) avec le Stade.`);
    }
  }

  if (activePlayer.cards[CardId.CHAINE_TELEVISION] > 0 && CARDS[CardId.CHAINE_TELEVISION].activations.includes(total)) {
    pendingActions.push({ type: 'STEAL_5', sourcePlayerId: activePlayer.id });
  }

  if (activePlayer.cards[CardId.CENTRE_AFFAIRES] > 0 && CARDS[CardId.CENTRE_AFFAIRES].activations.includes(total)) {
    pendingActions.push({ type: 'TRADE_CARD', sourcePlayerId: activePlayer.id });
  }

  if (pendingActions.length > 0) {
    newState.pendingPurpleActions = pendingActions;
    newState.turnState = TurnState.PURPLE_ACTION;
  } else {
    newState.turnState = TurnState.BUY_PHASE;
  }

  return newState;
};

export const resolvePurpleAction = (
  state: GameState,
  actionIndex: number,
  targetPlayerId: string,
  giveCardId?: CardId,
  takeCardId?: CardId
): GameState => {
  const newState = { ...state };
  const action = newState.pendingPurpleActions[actionIndex];
  const activePlayer = newState.players[newState.currentPlayerIndex];
  const targetPlayer = newState.players.find(p => p.id === targetPlayerId);

  if (!action || !targetPlayer) return state;

  if (action.type === 'STEAL_5') {
    const amount = Math.min(targetPlayer.coins, 5);
    targetPlayer.coins -= amount;
    activePlayer.coins += amount;
    newState.logs.push(`${activePlayer.name} vole ${amount} pièce(s) à ${targetPlayer.name} (Chaîne de télévision).`);
  } else if (action.type === 'TRADE_CARD' && giveCardId && takeCardId) {
    if (activePlayer.cards[giveCardId] > 0 && targetPlayer.cards[takeCardId] > 0) {
      activePlayer.cards[giveCardId]--;
      targetPlayer.cards[giveCardId]++;
      
      targetPlayer.cards[takeCardId]--;
      activePlayer.cards[takeCardId]++;
      
      newState.logs.push(`${activePlayer.name} échange ${CARDS[giveCardId].name} contre ${CARDS[takeCardId].name} de ${targetPlayer.name} (Centre d'affaires).`);
    }
  }

  newState.pendingPurpleActions.splice(actionIndex, 1);
  if (newState.pendingPurpleActions.length === 0) {
    newState.turnState = TurnState.BUY_PHASE;
  }
  return newState;
};

export const buyCard = (state: GameState, cardId: CardId | null): GameState => {
  const newState = { ...state };
  const activePlayer = newState.players[newState.currentPlayerIndex];

  if (cardId) {
    const card = CARDS[cardId];
    if (activePlayer.coins >= card.cost && newState.supply[cardId] > 0) {
      // Check purple limit
      if (card.color === CardColor.PURPLE && activePlayer.cards[cardId] > 0) {
        // Cannot buy more than 1 of each purple card
        return state;
      }
      
      activePlayer.coins -= card.cost;
      activePlayer.cards[cardId]++;
      newState.supply[cardId]--;
      newState.logs.push(`${activePlayer.name} achète ${card.name}.`);
    } else {
      return state; // Invalid buy
    }
  } else {
    newState.logs.push(`${activePlayer.name} n'achète rien.`);
  }

  newState.turnState = TurnState.CHECK_WIN;
  return checkWin(newState);
};

export const buildMonument = (state: GameState, monumentId: MonumentId): GameState => {
  const newState = { ...state };
  const activePlayer = newState.players[newState.currentPlayerIndex];
  const monument = MONUMENTS[monumentId];

  if (activePlayer.coins >= monument.cost && !activePlayer.monuments[monumentId]) {
    activePlayer.coins -= monument.cost;
    activePlayer.monuments[monumentId] = true;
    newState.logs.push(`${activePlayer.name} construit ${monument.name} !`);
  } else {
    return state; // Invalid build
  }

  newState.turnState = TurnState.CHECK_WIN;
  return checkWin(newState);
};

const checkWin = (state: GameState): GameState => {
  const activePlayer = state.players[state.currentPlayerIndex];
  const hasWon = Object.values(activePlayer.monuments).every(built => built);

  if (hasWon) {
    return {
      ...state,
      winner: activePlayer.id,
      turnState: TurnState.END_TURN,
      logs: [...state.logs, `${activePlayer.name} a construit tous ses monuments et gagne la partie ! 🎉`],
    };
  }

  return endTurn(state);
};

export const endTurn = (state: GameState): GameState => {
  const newState = { ...state };
  
  if (newState.extraTurn) {
    newState.extraTurn = false;
    newState.hasRerolled = false;
    newState.turnState = TurnState.START_TURN;
    newState.logs.push(`C'est de nouveau au tour de ${newState.players[newState.currentPlayerIndex].name}.`);
  } else {
    newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
    newState.hasRerolled = false;
    newState.turnState = TurnState.START_TURN;
    newState.logs.push(`C'est au tour de ${newState.players[newState.currentPlayerIndex].name}.`);
  }

  return newState;
};

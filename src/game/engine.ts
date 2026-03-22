import { CARDS, INITIAL_SUPPLY, MONUMENTS } from './cards';
import { CardColor, CardId, GameState, MonumentId, Player, TurnState } from './types';

export const createInitialState = (playerNames: string[], aiCount: number): GameState => {
  const players: Player[] = [];
  
  for (let i = 0; i < playerNames.length; i++) {
    players.push({
      id: `p${i}`,
      name: playerNames[i],
      isAI: false,
      coins: 3,
      cards: {
        [CardId.COMPOST]: 1,
        [CardId.AMAP]: 1,
        [CardId.EXTRACTION_CAOUTCHOUC]: 0,
        [CardId.PEAGE_AUTOROUTE]: 0,
        [CardId.MAISON_AUTONOME]: 0,
        [CardId.EOLIENNE]: 0,
        [CardId.PUITS_PETROLE]: 0,
        [CardId.CENTRALE_NUCLEAIRE]: 0,
        [CardId.AEROPORT]: 0,
        [CardId.BIOCOOP]: 0,
        [CardId.METHANISATION]: 0,
        [CardId.RAFFINERIE]: 0,
        [CardId.LE_SUN]: 0,
        [CardId.USINE_MICHELIN]: 0,
        [CardId.PANNEAUX_SOLAIRES]: 0,
      },
      monuments: {
        [MonumentId.GARE]: false,
        [MonumentId.CENTRE_COMMERCIAL]: false,
        [MonumentId.PARC_ATTRACTIONS]: false,
        [MonumentId.TOUR_RADIO]: false,
      },
      consecutiveNuclear: 0,
    });
  }

  for (let i = 0; i < aiCount; i++) {
    players.push({
      id: `ai${i}`,
      name: `IA ${i + 1}`,
      isAI: true,
      coins: 3,
      cards: {
        [CardId.COMPOST]: 1,
        [CardId.AMAP]: 1,
        [CardId.EXTRACTION_CAOUTCHOUC]: 0,
        [CardId.PEAGE_AUTOROUTE]: 0,
        [CardId.MAISON_AUTONOME]: 0,
        [CardId.EOLIENNE]: 0,
        [CardId.PUITS_PETROLE]: 0,
        [CardId.CENTRALE_NUCLEAIRE]: 0,
        [CardId.AEROPORT]: 0,
        [CardId.BIOCOOP]: 0,
        [CardId.METHANISATION]: 0,
        [CardId.RAFFINERIE]: 0,
        [CardId.LE_SUN]: 0,
        [CardId.USINE_MICHELIN]: 0,
        [CardId.PANNEAUX_SOLAIRES]: 0,
      },
      monuments: {
        [MonumentId.GARE]: false,
        [MonumentId.CENTRE_COMMERCIAL]: false,
        [MonumentId.PARC_ATTRACTIONS]: false,
        [MonumentId.TOUR_RADIO]: false,
      },
      consecutiveNuclear: 0,
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
    hasRerolled: false,
    extraTurn: false,
    globalWarming: 0,
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

  // Check if any RC card is activated to increase global warming
  let rcActivationsCount = 0;
  newState.players.forEach(player => {
    Object.entries(player.cards).forEach(([cardId, count]) => {
      const card = CARDS[cardId as CardId];
      if (count > 0 && card && card.activations.includes(total) && card.isRC) {
        // Only count if it actually activates for the player
        if (card.color === CardColor.BLUE || (card.color === CardColor.GREEN && player.id === activePlayer.id) || (card.color === CardColor.RED && player.id !== activePlayer.id) || (card.color === CardColor.PURPLE && player.id === activePlayer.id)) {
           rcActivationsCount += count;
        }
      }
    });
  });

  if (rcActivationsCount > 0) {
    const increment = 0.1 * rcActivationsCount;
    newState.globalWarming = (newState.globalWarming || 0) + increment;
    // Fix floating point issues
    newState.globalWarming = Math.round(newState.globalWarming * 10) / 10;
    newState.logs.push(`⚠️ Le réchauffement climatique augmente de ${increment.toFixed(1)}°C ! (${newState.globalWarming.toFixed(1)}°C)`);
  }

  const isRCMalusActive = (newState.globalWarming || 0) >= 1.95; // using 1.95 to avoid float precision issues

  // RED CARDS (Counter-clockwise from active player)
  for (let i = 1; i < newState.players.length; i++) {
    const targetIdx = (newState.currentPlayerIndex - i + newState.players.length) % newState.players.length;
    const targetPlayer = newState.players[targetIdx];
    
    // Péage autoroute
    if ((targetPlayer.cards[CardId.PEAGE_AUTOROUTE] || 0) > 0 && CARDS[CardId.PEAGE_AUTOROUTE].activations.includes(total)) {
      const amount = Math.min(activePlayer.coins, 2 * (targetPlayer.cards[CardId.PEAGE_AUTOROUTE] || 0));
      if (amount > 0) {
        activePlayer.coins -= amount;
        targetPlayer.coins += amount;
        newState.logs.push(`${targetPlayer.name} prend ${amount} pièce(s) à ${activePlayer.name} (Péage autoroute).`);
      }
    }
    // Le Sun
    if ((targetPlayer.cards[CardId.LE_SUN] || 0) > 0 && CARDS[CardId.LE_SUN].activations.includes(total)) {
      const amount = Math.min(activePlayer.coins, 3 * (targetPlayer.cards[CardId.LE_SUN] || 0));
      if (amount > 0) {
        activePlayer.coins -= amount;
        targetPlayer.coins += amount;
        newState.logs.push(`${targetPlayer.name} prend ${amount} pièce(s) à ${activePlayer.name} (Le Sun).`);
      }
    }
  }

  // BLUE CARDS (All players)
  newState.players.forEach(player => {
    const blueCards = [CardId.COMPOST, CardId.EXTRACTION_CAOUTCHOUC, CardId.EOLIENNE, CardId.PUITS_PETROLE, CardId.RAFFINERIE, CardId.PANNEAUX_SOLAIRES];
    blueCards.forEach(cardId => {
      if ((player.cards[cardId] || 0) > 0 && CARDS[cardId].activations.includes(total)) {
        let gain = 0;
        if (cardId === CardId.COMPOST) gain = 1;
        else if (cardId === CardId.EXTRACTION_CAOUTCHOUC) gain = isRCMalusActive ? 0 : 1;
        else if (cardId === CardId.EOLIENNE) gain = 1;
        else if (cardId === CardId.PUITS_PETROLE) gain = isRCMalusActive ? 1 : 2;
        else if (cardId === CardId.RAFFINERIE) gain = isRCMalusActive ? 1 : 4;
        else if (cardId === CardId.PANNEAUX_SOLAIRES) gain = 3;
        
        const totalGain = gain * (player.cards[cardId] || 0);
        if (totalGain > 0) {
          player.coins += totalGain;
          newState.logs.push(`${player.name} gagne ${totalGain} pièce(s) avec ${CARDS[cardId].name}.`);
        } else if (gain === 0 && cardId === CardId.EXTRACTION_CAOUTCHOUC) {
          newState.logs.push(`${player.name} ne gagne rien avec ${CARDS[cardId].name} à cause du RC.`);
        }
      }
    });
  });

  // GREEN CARDS (Active player only)
  const greenCards = [CardId.AMAP, CardId.MAISON_AUTONOME, CardId.BIOCOOP, CardId.METHANISATION, CardId.USINE_MICHELIN];
  greenCards.forEach(cardId => {
    if ((activePlayer.cards[cardId] || 0) > 0 && CARDS[cardId].activations.includes(total)) {
      let gain = 0;
      const count = activePlayer.cards[cardId] || 0;
      const hasMall = activePlayer.monuments[MonumentId.CENTRE_COMMERCIAL];

      if (cardId === CardId.AMAP) gain = (1 + (hasMall ? 1 : 0)) * count;
      else if (cardId === CardId.MAISON_AUTONOME) gain = (2 + (hasMall ? 1 : 0)) * count;
      else if (cardId === CardId.BIOCOOP) gain = 3 * (activePlayer.cards[CardId.AMAP] || 0) * count;
      else if (cardId === CardId.METHANISATION) gain = 3 * (activePlayer.cards[CardId.COMPOST] || 0) * count;
      else if (cardId === CardId.USINE_MICHELIN) gain = (isRCMalusActive ? 1 : 2) * (activePlayer.cards[CardId.EXTRACTION_CAOUTCHOUC] || 0) * count;

      if (gain > 0) {
        activePlayer.coins += gain;
        newState.logs.push(`${activePlayer.name} gagne ${gain} pièce(s) avec ${CARDS[cardId].name}.`);
      }
    }
  });

  // PURPLE CARDS (Active player only)
  if ((activePlayer.cards[CardId.CENTRALE_NUCLEAIRE] || 0) > 0 && CARDS[CardId.CENTRALE_NUCLEAIRE].activations.includes(total)) {
    activePlayer.consecutiveNuclear += 1;
    if (activePlayer.consecutiveNuclear >= 2) {
      activePlayer.coins = 0;
      activePlayer.cards = {
        [CardId.COMPOST]: 1,
        [CardId.AMAP]: 1,
        [CardId.EXTRACTION_CAOUTCHOUC]: 0,
        [CardId.PEAGE_AUTOROUTE]: 0,
        [CardId.MAISON_AUTONOME]: 0,
        [CardId.EOLIENNE]: 0,
        [CardId.PUITS_PETROLE]: 0,
        [CardId.CENTRALE_NUCLEAIRE]: 0,
        [CardId.AEROPORT]: 0,
        [CardId.BIOCOOP]: 0,
        [CardId.METHANISATION]: 0,
        [CardId.RAFFINERIE]: 0,
        [CardId.LE_SUN]: 0,
        [CardId.USINE_MICHELIN]: 0,
        [CardId.PANNEAUX_SOLAIRES]: 0,
      };
      activePlayer.monuments = {
        [MonumentId.GARE]: false,
        [MonumentId.CENTRE_COMMERCIAL]: false,
        [MonumentId.PARC_ATTRACTIONS]: false,
        [MonumentId.TOUR_RADIO]: false,
      };
      activePlayer.consecutiveNuclear = 0;
      newState.logs.push(`💥 BOUM ! La ville de ${activePlayer.name} est détruite par la Centrale nucléaire !`);
    } else {
      activePlayer.coins += 6;
      newState.logs.push(`${activePlayer.name} gagne 6 pièce(s) avec la Centrale nucléaire (Attention: ${activePlayer.consecutiveNuclear}/2).`);
    }
  } else {
    // Reset consecutive nuclear if not activated
    activePlayer.consecutiveNuclear = 0;
  }

  if ((activePlayer.cards[CardId.AEROPORT] || 0) > 0 && CARDS[CardId.AEROPORT].activations.includes(total)) {
    let totalGained = 0;
    newState.players.forEach(p => {
      if (p.id !== activePlayer.id) {
        const amount = Math.min(p.coins, 3);
        p.coins -= amount;
        totalGained += amount;
      }
    });
    if (totalGained > 0) {
      activePlayer.coins += totalGained;
      newState.logs.push(`${activePlayer.name} gagne ${totalGained} pièce(s) avec l'Aéroport.`);
    }
    
    if (isRCMalusActive) {
      const tax = Math.min(activePlayer.coins, 5);
      activePlayer.coins -= tax;
      newState.logs.push(`✈️ Taxe carbone ! ${activePlayer.name} paie ${tax} pièce(s) pour l'Aéroport.`);
    }
  }

  newState.turnState = TurnState.BUY_PHASE;

  return newState;
};

export const buyCard = (state: GameState, cardId: CardId | null): GameState => {
  const newState = { ...state };
  const activePlayer = newState.players[newState.currentPlayerIndex];

  if (cardId) {
    const card = CARDS[cardId];
    if (activePlayer.coins >= card.cost && newState.supply[cardId] > 0) {
      // Check purple limit
      if (card.color === CardColor.PURPLE && (activePlayer.cards[cardId] || 0) > 0) {
        // Cannot buy more than 1 of each purple card
        return state;
      }
      
      activePlayer.coins -= card.cost;
      activePlayer.cards[cardId] = (activePlayer.cards[cardId] || 0) + 1;
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


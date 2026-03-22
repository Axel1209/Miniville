import { CARDS, MONUMENTS } from './cards';
import { buildMonument, buyCard, rerollDice, rollDice } from './engine';
import { CardColor, CardId, GameState, MonumentId, TurnState } from './types';

export const playAITurn = (state: GameState): GameState => {
  let currentState = { ...state };
  const activePlayer = currentState.players[currentState.currentPlayerIndex];

  if (!activePlayer.isAI || currentState.winner) return currentState;

  if (currentState.turnState === TurnState.START_TURN || currentState.turnState === TurnState.CHOOSE_DICE) {
    let numDice = 1;
    if (activePlayer.monuments[MonumentId.GARE]) {
      const hasHighValueCards = 
        (activePlayer.cards[CardId.CENTRALE_NUCLEAIRE] || 0) > 0 ||
        (activePlayer.cards[CardId.AEROPORT] || 0) > 0 ||
        (activePlayer.cards[CardId.BIOCOOP] || 0) > 0 ||
        (activePlayer.cards[CardId.METHANISATION] || 0) > 0 ||
        (activePlayer.cards[CardId.RAFFINERIE] || 0) > 0 ||
        (activePlayer.cards[CardId.USINE_MICHELIN] || 0) > 0 ||
        (activePlayer.cards[CardId.PANNEAUX_SOLAIRES] || 0) > 0;
      
      numDice = hasHighValueCards ? 2 : 1;
    }
    return rollDice(currentState, numDice);
  } 
  
  if (currentState.turnState === TurnState.OPTIONAL_REROLL) {
    const total = currentState.diceResult.reduce((a, b) => a + b, 0);
    let hasActivation = false;
    
    for (const [cardId, count] of Object.entries(activePlayer.cards)) {
      const card = CARDS[cardId as CardId];
      if (count > 0 && card && card.activations.includes(total)) {
        hasActivation = true;
        break;
      }
    }
    
    return rerollDice(currentState, !hasActivation);
  } 
  
  if (currentState.turnState === TurnState.PURPLE_ACTION) {
    // No purple actions require targeting in the new set
    return currentState;
  } 
  
  if (currentState.turnState === TurnState.BUY_PHASE) {
    const monumentsToBuild = [
      MonumentId.GARE,
      MonumentId.CENTRE_COMMERCIAL,
      MonumentId.PARC_ATTRACTIONS,
      MonumentId.TOUR_RADIO,
    ];

    for (const monId of monumentsToBuild) {
      if (!activePlayer.monuments[monId] && activePlayer.coins >= MONUMENTS[monId].cost) {
        return buildMonument(currentState, monId);
      }
    }

    const buyOrder = [
      CardId.CENTRALE_NUCLEAIRE,
      CardId.RAFFINERIE,
      CardId.AEROPORT,
      CardId.METHANISATION,
      CardId.BIOCOOP,
      CardId.PANNEAUX_SOLAIRES,
      CardId.MAISON_AUTONOME,
      CardId.USINE_MICHELIN,
      CardId.LE_SUN,
      CardId.PEAGE_AUTOROUTE,
      CardId.PUITS_PETROLE,
      CardId.EOLIENNE,
      CardId.AMAP,
      CardId.COMPOST,
      CardId.EXTRACTION_CAOUTCHOUC,
    ];

    for (const cardId of buyOrder) {
      if (activePlayer.coins >= CARDS[cardId].cost && currentState.supply[cardId] > 0) {
        // Don't buy more than 1 purple card
        if (CARDS[cardId].color === CardColor.PURPLE && (activePlayer.cards[cardId] || 0) > 0) {
           continue;
        }
        return buyCard(currentState, cardId);
      }
    }

    return buyCard(currentState, null);
  }

  return currentState;
};

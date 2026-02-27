import { CARDS, MONUMENTS } from './cards';
import { buildMonument, buyCard, rerollDice, resolvePurpleAction, rollDice } from './engine';
import { CardColor, CardId, GameState, MonumentId, TurnState } from './types';

export const playAITurn = (state: GameState): GameState => {
  let currentState = { ...state };
  const activePlayer = currentState.players[currentState.currentPlayerIndex];

  if (!activePlayer.isAI || currentState.winner) return currentState;

  if (currentState.turnState === TurnState.START_TURN || currentState.turnState === TurnState.CHOOSE_DICE) {
    let numDice = 1;
    if (activePlayer.monuments[MonumentId.GARE]) {
      const hasHighValueCards = 
        activePlayer.cards[CardId.FROMAGERIE] > 0 ||
        activePlayer.cards[CardId.FABRIQUE_DE_MEUBLES] > 0 ||
        activePlayer.cards[CardId.MINE] > 0 ||
        activePlayer.cards[CardId.VERGER] > 0 ||
        activePlayer.cards[CardId.MARCHE_FRUITS_LEGUMES] > 0;
      
      numDice = hasHighValueCards ? 2 : 1;
    }
    return rollDice(currentState, numDice);
  } 
  
  if (currentState.turnState === TurnState.OPTIONAL_REROLL) {
    const total = currentState.diceResult.reduce((a, b) => a + b, 0);
    let hasActivation = false;
    
    for (const [cardId, count] of Object.entries(activePlayer.cards)) {
      if (count > 0 && CARDS[cardId as CardId].activations.includes(total)) {
        hasActivation = true;
        break;
      }
    }
    
    return rerollDice(currentState, !hasActivation);
  } 
  
  if (currentState.turnState === TurnState.PURPLE_ACTION) {
    const action = currentState.pendingPurpleActions[0];
    if (action.type === 'STEAL_5') {
      let targetPlayer = currentState.players.find(p => p.id !== activePlayer.id);
      for (const p of currentState.players) {
        if (p.id !== activePlayer.id && p.coins > (targetPlayer?.coins || 0)) {
          targetPlayer = p;
        }
      }
      return resolvePurpleAction(currentState, 0, targetPlayer!.id);
    } else if (action.type === 'TRADE_CARD') {
      let targetPlayer = currentState.players.find(p => p.id !== activePlayer.id);
      let takeCardId = CardId.MINE;
      let giveCardId = CardId.CHAMP_DE_BLE;

      const desiredCards = [CardId.MINE, CardId.FROMAGERIE, CardId.FABRIQUE_DE_MEUBLES, CardId.SUPERETTE];
      for (const p of currentState.players) {
        if (p.id === activePlayer.id) continue;
        for (const card of desiredCards) {
          if (p.cards[card] > 0) {
            targetPlayer = p;
            takeCardId = card;
            break;
          }
        }
      }

      const expendableCards = [CardId.CHAMP_DE_BLE, CardId.BOULANGERIE, CardId.FERME];
      for (const card of expendableCards) {
        if (activePlayer.cards[card] > 0) {
          giveCardId = card;
          break;
        }
      }

      return resolvePurpleAction(currentState, 0, targetPlayer!.id, giveCardId, takeCardId);
    }
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
      CardId.MINE,
      CardId.FROMAGERIE,
      CardId.FABRIQUE_DE_MEUBLES,
      CardId.SUPERETTE,
      CardId.FORET,
      CardId.FERME,
      CardId.BOULANGERIE,
      CardId.CHAMP_DE_BLE,
    ];

    for (const cardId of buyOrder) {
      if (activePlayer.coins >= CARDS[cardId].cost && currentState.supply[cardId] > 0) {
        return buyCard(currentState, cardId);
      }
    }

    return buyCard(currentState, null);
  }

  return currentState;
};

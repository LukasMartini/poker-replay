import React from 'react';

function colorFromSuit(suit) {
  if (suit === '♠' || suit === '♣') {
    return 'black';
  }
  return 'red';
}

const suitChars = {
  d: '♦',
  h: '♥',
  c: '♣',
  s: '♠',
}

function parseCard(card) {
  const rank = card.slice(0, -1);
  const suit = suitChars[card.slice(-1)];
  return { rank: rank, suit: suit };
}

const playerOffsets = [
  { x: 84, y: 2 },
  { x: 150, y: 10 },
  { x: 190, y: 40 },
  { x: 150, y: 75 },
  { x: 84, y: 85 },
  { x: 20, y: 75 },

  { x: -20, y: 40 },
  { x: 20, y: 10 },
];

const playerDealerChipOffsets = [
  { x: 0, y: 17 },
  { x: -5, y: 14 },
  { x: -10, y: 0 },
  { x: 20, y: -10 },
  { x: 40, y: -5 },
  { x: 35, y: 0 },
  { x: 45, y: 20 },
  { x: 12, y: 20 },
];

const playerStackOffsets = [
  { x: 15, y: 15 },
  { x: 10, y: 15 },
  { x: -10, y: 6 },
  { x: 5, y: -10 },
  { x: 15, y: -10 },
  { x: 20, y: -10 },
  { x: 45, y: 6 },
  { x: 25, y: 15 },
];

/*
cards={[{suit: "♠", rank: "K"}, {suit: "♥", rank: "K"}]}
*/

const Chip = (props) => {
  return (
    <g transform={props.transform ? `scale(0.02), ${props.transform}` : 'scale(0.02)'}>
      <ellipse cx="100" cy="80  " rx="90" ry="20" fill={props.color} />
      <rect x="10" y="50" width="180" height="30" fill={props.color} />
      <ellipse cx="100" cy="50" rx="90" ry="20" fill={props.color} />
    </g>
  )
}

const Stack = (props) => {
  function calculateAverageChips(betAmount, bigBlind) {
    const a = 1;  
    const c = 1;  

    const ratio = betAmount/bigBlind;
    
    if (ratio <= 0) {
        return c;
    }

    return Math.ceil(a * (Math.log(ratio)) + c);
  }

  function chipColor(chipNum, total) {
    const colors = ["#ffb03a", "#1e1e1e", "#3a89FF", "#ff3a3a", "#9d3aff", "#3feb00"];
    // const ratio = chipNum/total;
    // const index = Math.floor(Math.log(ratio + 1) / Math.log(2) * (colors.length - 1));
    return colors[chipNum % colors.length];

  }
 
  const number = calculateAverageChips(props.bet || 0, props.bb || 0);


  return (
    <>
    {Array.from({ length: parseInt(number) }, (_, index) => (
      <Chip transform={`translate(0, ${index * -40})`} color={chipColor(index, number)} />
    ))}
    </>
  )
}

const PlayerInfo = (props) => {
  return (
    <>
      <rect x="0" y="0" width="30" height="12" fill="grey" stroke-width="0.5" rx="4" stroke="white" />
      <text  fontWeight="bold" x="15" y="4" fontSize="3.2" fill="white" text-anchor="middle" dominant-baseline="middle">
        <a href={`player/${props.username}`}>{props.username}</a>
      </text>
      <text x="15" y="9" font-size="3.2" fill="white" text-anchor="middle" dominant-baseline="middle">
        {props.stack}
      </text>
    </>
  );
}

const DealerChip = (props) => {
  return (
    <g transform={props.transform}>
      <circle cx="0" cy="0" r="3" fill="white" />
      <text fontWeight="bold" x="0" y="0" font-size="3.2" fill="black" text-anchor="middle" dominant-baseline="middle">D</text>
    </g>
  )
};

const PokerCards = (props) => {
  return (
    <g transform="translate(25, 5)" >
      <g transform="scale(0.3), rotate(-10, 9, 15)">
        <rect x="0" y="0" width="18" height="30" fill={props.cards ? "white" : "#ab2e2e"} strokeWidth="0.5" rx="2" stroke={props.cards ? "black" : "white"} />
        {props.cards && (
          <>
            <text x="2" y="7" fontSize="6" fill={colorFromSuit(props.cards[0].suit)}>{props.cards[0].rank}</text>
            <text x="5" y="20" fontSize="15" fill={colorFromSuit(props.cards[0].suit)}>{props.cards[0].suit}</text>
          </>
        )}
      </g>
      <g transform="translate(5, 0), scale(0.3), rotate(10, 9, 15)">
        <rect x="0" y="0" width="18" height="30" fill={props.cards ? "white" : "#ab2e2e"} strokeWidth="0.5" rx="2" stroke={props.cards ? "black" : "white"} />
        {props.cards && (
          <>
            <text x="2" y="7" fontSize="6" fill={colorFromSuit(props.cards[1].suit)}>{props.cards[1].rank}</text>
            <text x="5" y="20" fontSize="15" fill={colorFromSuit(props.cards[1].suit)}>{props.cards[1].suit}</text>
          </>
        )}
      </g>
    </g>
  )
}

const PokerTable = (props) => {
  const sb = props.actions[0].name;
  const sbIndex = props.players.findIndex(action => action.name === sb);
  const round = props.actions[props.actions.length - 1].betting_round;

  let dealerID = sbIndex - 1;

  if (dealerID == -1) {
    dealerID = props.players.length - 1;
  }

  function isPlayerDealer(playerID) {
    return playerID == dealerID;
  }

  function playersLastAction(name) {
    const playerActions = props.actions.filter(action => action.name === name && action.betting_round === round);
    if (playerActions.length === 0) {
      return null;
    }
    return playerActions[playerActions.length - 1];
  }

  function lastActionCollect() {
    return props.actions[props.actions.length - 1] && props.actions[props.actions.length - 1].action_type == 'collect';
  }

  function checkFolded(name) {
    const playerActions = props.actions.filter(action => action.name === name);
    if (playerActions.length > 0 && playerActions[playerActions.length - 1].action_type == 'fold') {
      return true;
    }
    return false;
  }

  function calculatePot() {
    const playerActions = props.actions.filter(action => action.betting_round !== round && action.amount != null);
    const pot = playerActions.reduce((total, action) => total + parseFloat(action.amount), 0);
    return pot.toFixed(2);
  }

  function calculateStackSize(name, stack_size) {
    const playerActions = props.actions.filter(action => action.name === name && action.amount != null);
    const didWin = props.actions.filter(action => action.name === name && (action.betting_round == 'Showdown'));

    const bets = playerActions.reduce((total, action) => total + parseFloat(action.amount), 0).toFixed(2);
    if (didWin.length >0) {
      if (didWin[0] && didWin[0].action_type == 'collect') {
        return parseFloat(stack_size) + parseFloat(didWin[0].amount);
      }  
    }
    return (stack_size - bets).toFixed(2);
  }

  return (
    <svg viewBox="0 0 230 100">
      <defs>
        <radialGradient id="greenGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: "rgb(34,139,34)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "rgb(0,100,0)", stopOpacity: 1 }} />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="50" rx="90" ry="40" fill="url(#greenGradient)" stroke-width="3" stroke="brown" />

      {props.players.map((player, index) => (
        <g key={index} transform={`translate(${playerOffsets[index].x}, ${playerOffsets[index].y})`}>
          <PlayerInfo username={player.name} stack={calculateStackSize(player.name, player.stack_size)} />
          {isPlayerDealer(index) && <DealerChip transform={`translate(${playerDealerChipOffsets[index].x}, ${playerDealerChipOffsets[index].y})`} />}
          {!checkFolded(player.name) && !player.hole_card1 && <PokerCards/>}
          {!checkFolded(player.name) && player.hole_card1 && <PokerCards cards={[parseCard(player.hole_card1), parseCard(player.hole_card2)]}/>}
          {playersLastAction(player.name) && (
            <g transform={`translate(${playerStackOffsets[index].x}, ${playerStackOffsets[index].y})`}>
              {(playersLastAction(player.name).action_type != 'fold' && playersLastAction(player.name).action_type != 'check') && (<Stack bb={props.hand[0] && props.hand[0].big_blind} bet={parseFloat(playersLastAction(player.name).amount)}/>) }
              <text x="0" y="5" font-size="3.2" fill="white" text-anchor="middle" dominant-baseline="middle">
                {playersLastAction(player.name).action_type} {playersLastAction(player.name).amount || ''}
              </text>
            </g>
          )
          }
        </g>
      ))}
      {console.log(lastActionCollect()  )}
      {round != "Preflop" && round != "Showdown" && !lastActionCollect() && (
        <g transform="translate(87, 27)">
          <circle cx="4" cy="3.5" r="3" fill="grey" />
          <rect x="4" y="0.5" width="16" height="6" fill="grey" />
          <circle cx="20" cy="3.5" r="3" fill="grey" />
          <text x="12" y="4" font-size="3.2" fill="white" text-anchor="middle" dominant-baseline="middle">
            Pot: {calculatePot()}
          </text>
        </g> 
      )}
      {
        (round == "Flop" || round == "Turn" || round == "River" || round == "Showdown") && (
          <>
            <g>
              <rect x="50" y="35" width="18" height="30" fill="white" stroke-width="0.5" rx="2" stroke="black" />
              <text x="52" y="42" font-size="6" fill={colorFromSuit(parseCard(props.hand[0].flop_card1).suit)}>{parseCard(props.hand[0].flop_card1).rank}</text>
              <text x="55" y="55" font-size="15" fill={colorFromSuit(parseCard(props.hand[0].flop_card1).suit)}>{parseCard(props.hand[0].flop_card1).suit}</text>
            </g>
            <g>
              <rect x="70" y="35" width="18" height="30" fill="white" stroke-width="0.5" rx="2" stroke="black" />
              <text x="72" y="42" font-size="6" fill={colorFromSuit(parseCard(props.hand[0].flop_card2).suit)}>{parseCard(props.hand[0].flop_card2).rank}</text>
              <text x="75" y="55" font-size="15" fill={colorFromSuit(parseCard(props.hand[0].flop_card2).suit)}>{parseCard(props.hand[0].flop_card2).suit}</text>
            </g>
            <g>
              <rect x="90" y="35" width="18" height="30" fill="white" stroke-width="0.5" rx="2" stroke="black" />
              <text x="92" y="42" font-size="6" fill={colorFromSuit(parseCard(props.hand[0].flop_card3).suit)}>{parseCard(props.hand[0].flop_card3).rank}</text>
              <text x="95" y="55" font-size="15" fill={colorFromSuit(parseCard(props.hand[0].flop_card3).suit)}>{parseCard(props.hand[0].flop_card3).suit}</text>
            </g>

          </>
        )
      }
      {
        (round == "Turn" || round == "River" || round == "Showdown") && (
          <>
            <g>
              <rect x="110" y="35" width="18" height="30" fill="white" stroke-width="0.5" rx="2" stroke="black" />
              <text x="112" y="42" font-size="6" fill={colorFromSuit(parseCard(props.hand[0].turn_card).suit)}>{parseCard(props.hand[0].turn_card).rank}</text>
              <text x="115" y="55" font-size="15" fill={colorFromSuit(parseCard(props.hand[0].turn_card).suit)}>{parseCard(props.hand[0].turn_card).suit}</text>
            </g>

          </>
        )
      }
      {
        (round == "River" || round == "Showdown") && (
          <>
            <g>
              <rect x="130" y="35" width="18" height="30" fill="white" stroke-width="0.5" rx="2" stroke="black" />
              <text x="132" y="42" font-size="6" fill={colorFromSuit(parseCard(props.hand[0].river_card).suit)}>{parseCard(props.hand[0].river_card).rank}</text>
              <text x="135" y="55" font-size="15" fill={colorFromSuit(parseCard(props.hand[0].river_card).suit)}>{parseCard(props.hand[0].river_card).suit}</text>
            </g>
          </>
        )
      }
    </svg>

  );
};

export default PokerTable;
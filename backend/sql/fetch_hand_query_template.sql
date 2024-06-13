-- Take hand_id as input
-- Assume that user_id can be fetched from current_user.
-- Ensure that hand_id matches user_id and user_id matches current user
-- Pull total pot, player action, player cards, and board cards. Only pull based on user_id.

PREPARE hand_data AS (
    SELECT poker_hand.id, p.name, poker_hand.total_pot, player_cards.hole_card1, player_cards.hole_card2,
           player_action.hand_id, player_action.amount,
           board_cards.flop_card1, board_cards.flop_card2, board_cards.flop_card3,
           board_cards.turn_card, board_cards.river_card
    FROM poker_hand, (SELECT * FROM player WHERE player.name = $2) p, player_action, player_cards, board_cards
    WHERE poker_hand.id = $1 AND player_action.player_id = p.id AND player_action.hand_id = $1
          AND player_cards.hand_id = $1 AND player_cards.player_id = p.id
          AND board_cards.hand_id = $1
);
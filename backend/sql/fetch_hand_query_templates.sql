-- Take hand_id as input
-- Assume that user_id can be fetched from current_user.
-- Ensure that hand_id matches user_id and user_id matches current user
-- Pull total pot, player action, player cards, and board cards. Only pull based on user_id.

-- Search all hands associated with a given player

-- Search all actions associated with a particular hand

-- Search all session, board, player card, and player action information (SAMPLE APP). Input is only hand_id.
-- TODO: enforce access control.
    -- Search board info, session info. 
    PREPARE one_time_hand_info AS (
        SELECT poker_hand.id, poker_hand.session_id, poker_hand.total_pot, poker_hand.rake,
               poker_hand.played_at, poker_session.table_name, poker_session.game_type, poker_hand.small_blind,
               poker_hand.big_blind, board_cards.flop_card1, board_cards.flop_card2, board_cards.flop_card3,
               board_cards.turn_card, board_cards.river_card
        FROM poker_hand, poker_session, board_cards
        WHERE poker_hand.id = $1 AND poker_hand.session_id = poker_session.id AND board_cards.hand_id = $1
    );

    -- Search players and player actions.
    PREPARE player_actions_in_hand AS (
        SELECT player.id, player.name, player_action.id, player_action.hand_id, player_action.action_type, 
               player_action.amount, player_action.betting_round
        FROM player, player_action
        WHERE player_action.hand_id = $1 AND player_action.player_id = player.id
    );

    -- Search players and player cards.
    PREPARE player_cards_in_hand AS (
        SELECT player.id, player.name, player_cards.hand_id, player_cards.hole_card1, player_cards.hole_card2,
               player_cards.position, player_cards.stack_size
        FROM player, player_cards
        WHERE player_cards.hand_id = $1 AND player_cards.player_id = player.id
    );


-- Original query - now depricated.
-- PREPARE hand_data AS (
--     SELECT poker_hand.id, p.name, poker_hand.total_pot, player_cards.hole_card1, player_cards.hole_card2,
--            player_action.hand_id, player_action.amount,
--            board_cards.flop_card1, board_cards.flop_card2, board_cards.flop_card3,
--            board_cards.turn_card, board_cards.river_card
--     FROM poker_hand, (SELECT * FROM player WHERE player.name = $2) p, player_action, player_cards, board_cards
--     WHERE poker_hand.id = $1 AND player_action.player_id = p.id AND player_action.hand_id = $1
--           AND player_cards.hand_id = $1 AND player_cards.player_id = p.id
--           AND board_cards.hand_id = $1
-- );
-- ---------- Create a User ---------- --
SELECT COUNT(*) FROM users WHERE username = 'nuu_user' OR email = 'enigma@zen.mst'
-- If the user account exists, query stops here. If it is a new account, see below.
INSERT INTO users (username, email, password_hash, salt, token)
VALUES ('nuu_user', 'enigma@zen.mst', '$2b$12$RFi87s8TkByRg7TDec6crgRilqwDOc0mlatH6gMoFCZIXjGOhVMje', '$2b$12$RFi87s8TkByRgMXBec6bxe', 'd8euoc45-dfa4-45b6-9f49-fe903e80607a');

-- ---------- Upload a File ---------- --
INSERT INTO uploads (user_id, file_name, status)
VALUES (1, 'test_file.nonbin', 'processing')
RETURNING id;

-- ---------- Update Upload Status ---------- --
UPDATE uploads SET status = 'complete' WHERE id = 3;

-- ---------- Delete a File ---------- --
WITH check_ownership AS (
    SELECT 1 FROM uploads WHERE id = 3 AND user_id = 1
)
DELETE FROM uploads
WHERE id = 3 AND EXISTS (SELECT 1 FROM check_ownership);

-- ---------- Get Hand Count Overall ---------- --
SELECT COUNT(*) hands
FROM poker_session session
JOIN poker_hand hand ON session.id = hand.session_id
WHERE user_id = 1  AND session.game_type = 'Cash';

-- ---------- Get Hand Count for a Session ---------- --
SELECT COUNT(*) hands
FROM poker_session session
JOIN poker_hand hand ON session.id = hand.session_id
WHERE user_id = 1 AND session.id = 14;

-- ---------- Get Hand Count with a Specific Player ---------- --
SELECT COUNT(*) hands
FROM poker_session session
JOIN poker_hand hand ON session.id = hand.session_id
WHERE user_id = 3 AND session.game_type = 'Cash' AND EXISTS
            (SELECT * FROM player_cards WHERE hand_id = hand.id AND player_id = 
                (SELECT id FROM player WHERE name = 'Villa0722'));

-- ---------- Get Cash Flow ---------- --
WITH user_player AS (
        SELECT id FROM player WHERE player.user_id = 1
),
hands AS (
    SELECT hand.id id, played_at
    FROM poker_session session
    JOIN poker_hand hand ON session.id = hand.session_id
    WHERE user_id = 1 AND session.game_type = 'Cash'
),
bet_amounts AS (
    SELECT hand_id, SUM(
    CASE
        WHEN action_type = 'collect' THEN amount
        ELSE -amount
    END
    ) as amount
    FROM user_player, player_action
    JOIN hands ON hands.id = player_action.hand_id
    WHERE player_id = user_player.id
    GROUP BY hand_id, player_id
)
SELECT played_at, hand.id AS hand_id, COALESCE(SUM(amount), 0) amount
FROM hands hand
JOIN bet_amounts on hand.id = bet_amounts.hand_id
GROUP BY hand.id, played_at
ORDER BY played_at DESC
LIMIT 50
OFFSET 0;

-- ---------- Get Hand Data ---------- --
SELECT poker_hand.id, poker_hand.session_id, poker_hand.total_pot, poker_hand.rake,
        poker_hand.played_at, poker_session.table_name, poker_session.game_type, poker_hand.small_blind,
        poker_hand.big_blind, 
        board_cards.flop_card1, board_cards.flop_card2, board_cards.flop_card3,
        board_cards.turn_card, board_cards.river_card
FROM poker_hand
JOIN poker_session ON poker_hand.session_id = poker_session.id
LEFT JOIN board_cards ON board_cards.hand_id = poker_hand.id
LEFT JOIN authorized ON authorized.hand_id = poker_hand.id AND authorized.user_id = %s
WHERE poker_hand.id = 1 AND (poker_session.user_id = 1 OR authorized.user_id IS NOT NULL);

SELECT player.id as player_id, player.name, player_action.id, player_action.hand_id, player_action.action_type, 
        player_action.amount, player_action.betting_round
FROM player
JOIN player_action ON player_action.player_id = player.id
JOIN poker_hand ON player_action.hand_id = poker_hand.id
JOIN poker_session ON poker_hand.session_id = poker_session.id
LEFT JOIN authorized ON authorized.hand_id = poker_hand.id AND authorized.user_id = %s
WHERE player_action.hand_id = 1 AND (poker_session.user_id = 1 OR authorized.user_id IS NOT NULL)
ORDER BY player_action.id;

SELECT player.id as player_id, player.name, player_cards.hand_id, player_cards.hole_card1, player_cards.hole_card2,
        player_cards.position, player_cards.stack_size
FROM player
JOIN player_cards ON player_cards.player_id = player.id
JOIN poker_hand ON player_cards.hand_id = poker_hand.id
JOIN poker_session ON poker_hand.session_id = poker_session.id
LEFT JOIN authorized ON authorized.hand_id = poker_hand.id AND authorized.user_id = %s
WHERE player_cards.hand_id = 1 AND (poker_session.user_id = 1 OR authorized.user_id IS NOT NULL)
ORDER BY player_cards.position;

-- ---------- Get Profile Data ---------- --
SELECT username, email, created_at FROM users WHERE id = 1;

SELECT uploads.id as upload_id, uploads.file_name, uploads.uploaded_at
FROM uploads
WHERE uploads.user_id = 1 AND uploads.status = 'completed';

SELECT s.table_name, s.game_type, s.currency, s.total_hands, s.max_players, s.start_time, s.end_time, s.id
FROM poker_session as s
WHERE s.user_id = 1;

SELECT poker_hand.id,
        poker_hand.session_id,
        poker_hand.site_hand_id,
        poker_hand.small_blind,
        poker_hand.big_blind,
        poker_hand.total_pot,
        poker_hand.rake,
        poker_hand.played_at,
        users.username
FROM poker_session
JOIN poker_hand ON poker_session.id = poker_hand.session_id
FULL OUTER JOIN authorized ON poker_hand.id = authorized.hand_id
JOIN users ON poker_session.user_id = users.id
WHERE poker_hand.id IN (SELECT hand_id FROM authorized WHERE user_id = 1);

-- ---------- Cash Flow to Player -------- --
-- find the hands where the player_id plays 
WITH user_player AS (
	SELECT id FROM player WHERE player.user_id = 1
),
target_player AS (
	SELECT id FROM player WHERE player.name = 1
),
-- all hands from cash sessions you own    
hands AS (
	SELECT id, played_at
	FROM poker_hand hand
	WHERE EXISTS (
    	SELECT 1 FROM poker_session
    	WHERE poker_session.id = hand.session_id
        	AND poker_session.user_id = 1
        	AND poker_session.tournament_id IS NULL
			AND EXISTS ( SELECT * FROM player_cards, target_player WHERE hand_id = hand.id AND player_id = target_player.id )
	)
),
-- map each hand to the player that collected it
collected_hands AS (
	SELECT hand.id AS hand_id, (
        	SELECT act.player_id
        	FROM player_action act
        	WHERE act.hand_id = hand.id
            	AND act.action_type = 'collect' -- should never have multiple collects per hand
        	LIMIT 1
    	) AS collector_id, played_at
	FROM hands hand
),
-- the total amount that each person contributed to each hand
bet_amounts AS (
	SELECT hand_id, player_id, SUM(amount) as amount
	FROM player_action, user_player, target_player
	WHERE hand_id IN (SELECT id FROM hands)
		AND (player_id = user_player.id OR player_id = target_player.id)
		AND action_type in ('call', 'bet', 'raise', 'all-in')
	GROUP BY hand_id, player_id
),
-- cash flow by hand and player to/from
cash_flow as (
	SELECT
    	-- relevant player, the non-user player involved
    	(CASE
        	WHEN hand.collector_id = user_player.id
        	THEN bet_amounts.player_id
    
        	WHEN bet_amounts.player_id = user_player.id
        	THEN hand.collector_id
    
        	ELSE NULL
    	END) as player_id,
    	-- raw cash flow
    	CASE
        	-- when we win, add the amount we won from this player
        	WHEN hand.collector_id = user_player.id
        	THEN bet_amounts.amount
    
        	-- when someone else wins, if we bet, subtract the amount we lost to this player
        	WHEN bet_amounts.player_id = user_player.id
        	THEN -bet_amounts.amount
    
        	-- if we didn't win or place this bet, disregard the value
        	ELSE 0
    	END as amount,
		hand.hand_id,
		hand.played_at
	FROM user_player, collected_hands hand
	JOIN bet_amounts ON hand.hand_id = bet_amounts.hand_id
)
SELECT played_at, hand_id, amount
FROM target_player, cash_flow
WHERE cash_flow.player_id = target_player.id
ORDER BY played_at DESC
LIMIT 50
OFFSET 0;

-- ---------- Get Sessions ---------- --
SELECT *
FROM poker_session
WHERE user_id = 1
LIMIT 50
OFFSET 0;

-- ---------- Get Matching Players ---------- --
SELECT DISTINCT p.id AS player_id, p.name AS player_name
FROM poker_hand ph
JOIN poker_session ps ON ph.session_id = ps.id
JOIN player_cards pc ON ph.id = pc.hand_id
JOIN player p ON pc.player_id = p.id
WHERE ps.user_id = 1
    AND p.name ILIKE 'poker';

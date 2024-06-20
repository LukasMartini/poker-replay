-- find the hands where the player_id plays
WITH user_player AS (
    SELECT id FROM player WHERE player.user_id = '1'
),
-- all hands from cash sessions you own	
hands AS (
    SELECT id
    FROM poker_hand hand
    WHERE EXISTS (
		SELECT 1 FROM poker_session
		WHERE poker_session.id = hand.session_id
			AND poker_session.user_id = '1'
			AND poker_session.tournament_id IS NULL
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
        ) AS collector_id
    FROM hands hand
),
-- the total amount that each person contributed to each hand
bet_amounts AS (
	SELECT hand_id, player_id, SUM(amount) as amount
	FROM player_action
	WHERE action_type in ('call', 'bet', 'raise', 'all-in')
	GROUP BY hand_id, player_id
)
-- cash flow by hand and player to/from
SELECT hand_id, 
	-- relevant player, the non-user player involved
	(CASE
		WHEN hand.collector_id = user_player.id
		THEN bet_amounts.player_id

		WHEN bet_amounts.player_id = user_player.id
		THEN hand.collector_id

		ELSE NULL
	END) as player_id,
	-- raw cash flow
	(CASE
		-- when we win, add the amount we won from this player
		WHEN hand.collector_id = user_player.id
		THEN bet_amounts.amount

		-- when someone else wins, if we bet, subtract the amount we lost to this player
		WHEN bet_amounts.player_id = user_player.id
		THEN -bet_amounts.amount

		-- if we didn't win or place this bet, disregard the value
		ELSE 0
	END) as amount
FROM user_player, collected_hands hand
NATURAL JOIN bet_amounts
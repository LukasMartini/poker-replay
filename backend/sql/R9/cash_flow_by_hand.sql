WITH user_player AS (
    SELECT id FROM player WHERE player.user_id = 1 -- inject
),
hands AS (
	SELECT hand.id id, played_at
	FROM poker_session session
    JOIN poker_hand hand ON session.id = hand.session_id
	WHERE user_id = 1 AND session.game_type = 'Cash' -- inject
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
SELECT played_at, hand.id, COALESCE(SUM(amount), 0) amount
FROM hands hand
JOIN bet_amounts on hand.id = bet_amounts.hand_id
GROUP BY hand.id, played_at
ORDER BY played_at

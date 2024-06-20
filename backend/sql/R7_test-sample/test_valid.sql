-- Correct case where user does have authorization
INSERT INTO authorized(user_id, hand_id)
SELECT 2, poker_hand.id FROM users 
	JOIN poker_session ON users.id = poker_session.user_id
	JOIN poker_hand ON poker_session.id = poker_hand.session_id
	WHERE 
		users.token = '82fd7671-cfe6-49a6-b3b8-a0df504bf55f'
		AND poker_hand.id = 9;
-- Incorrect case where user has no authorization
INSERT INTO authorized(user_id, hand_id)
SELECT 2, poker_hand.id FROM users 
	JOIN poker_session ON users.id = poker_session.user_id
	JOIN poker_hand ON poker_session.id = poker_hand.session_id
	WHERE 
		users.token = 'f273d736-807e-4f8e-b919-0bc7a558d59b'
		AND poker_hand.id = 9;
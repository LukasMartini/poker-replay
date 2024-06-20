-- Incorrect case where user has no authorization
INSERT INTO authorized(user_id, hand_id)
SELECT 2, poker_hand.id FROM users 
	JOIN poker_session ON users.id = poker_session.user_id
	JOIN poker_hand ON poker_session.id = poker_hand.session_id
	WHERE 
		users.token = 'f273d736-807e-4f8e-b919-0bc7a558d59b'
		AND poker_hand.id = 9;

-- Correct case where user does have authorization
INSERT INTO authorized(user_id, hand_id)
SELECT 2, poker_hand.id FROM users 
	JOIN poker_session ON users.id = poker_session.user_id
	JOIN poker_hand ON poker_session.id = poker_hand.session_id
	WHERE 
		users.token = '82fd7671-cfe6-49a6-b3b8-a0df504bf55f'
		AND poker_hand.id = 9;

-- Check all hands the user is authorized to see
SELECT poker_hand.id,
	poker_hand.session_id,
	poker_hand.site_hand_id,
	poker_hand.small_blind,
	poker_hand.big_blind,
	poker_hand.total_pot,
	poker_hand.rake,
	poker_hand.played_at
	FROM poker_session
	JOIN poker_hand ON poker_session.id = poker_hand.session_id
	FULL OUTER JOIN authorized ON poker_hand.id = authorized.hand_id
	WHERE poker_session.user_id = 2 OR poker_hand.id IN 
		(SELECT hand_id FROM authorized WHERE user_id = 2);
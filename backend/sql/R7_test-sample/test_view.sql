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
	JOIN authorized ON poker_hand.id = authorized.hand_id
	WHERE poker_session.user_id = 2 OR poker_hand.id IN 
		(SELECT hand_id FROM authorized WHERE user_id = 2);
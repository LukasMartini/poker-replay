PREPARE getUserID(text) AS
  SELECT id FROM users WHERE username = $1 OR email = $1;

PREPARE share(integer, integer, integer) AS
  INSERT INTO authorized(user_id, hand_id)
  SELECT $2, poker_hand.id FROM users 
    JOIN poker_session ON users.id = poker_session.user_id
    JOIN poker_hand ON poker_session.id = poker_hand.session_id
    WHERE 
      users.id = $1
      AND poker_hand.id = $3;

PREPARE sharedWith(integer) AS
  SELECT users.id, users.username, users.email
    FROM users
    JOIN authorized ON users.id = authorized.user_id
    WHERE authorized.hand_id = $1;

  PREPARE unshare(integer, integer, integer) AS  
    DELETE FROM authorized
      WHERE user_id = $3 AND hand_id = $2 AND hand_id IN 
        (SELECT poker_hand.id FROM poker_session JOIN poker_hand ON poker_session.id = poker_hand.session_id WHERE user_id = $1); 

-- CREATE INDEX hand_session ON poker_hand(session_id);
-- CREATE INDEX session_user ON poker_session(user_id);
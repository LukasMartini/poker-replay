-- Function to confirm that a CHAR(2) card takes the correct form via regex
CREATE OR REPLACE FUNCTION is_valid_card(card CHAR(2))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN card IS NULL OR card ~ '^[2-9TJQKA][cdhs]$';
END;
$$;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash CHAR(60), -- Assuming bcrypt hash which outputs 60 characters
    salt CHAR(29), -- Storing bcrypt salt, which is 29 characters long
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token CHAR(36)
);

CREATE TABLE poker_session (
    id SERIAL PRIMARY KEY,
    user_id INT,
    tournament_id BIGINT NULL,
    buy_in NUMERIC(10, 2), -- Only applicable for tournaments
    table_name VARCHAR(50),
    game_type VARCHAR(50),
    currency VARCHAR(10),
    total_hands INT,
    max_players INT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id), -- User that uploaded this session
    CHECK (end_time IS NULL OR end_time >= start_time)
);

CREATE TABLE poker_hand (
    id SERIAL PRIMARY KEY,
    session_id INT,
    site_hand_id BIGINT,
    small_blind NUMERIC(10, 2),
    big_blind NUMERIC(10, 2),
    total_pot NUMERIC(10, 2),
    rake NUMERIC(10, 2),
    played_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES poker_session(id)
);

CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    user_id INT, -- user that owns this player
    name VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE player_action (
    id SERIAL PRIMARY KEY,
    player_id INT,
    hand_id INT,
    betting_round VARCHAR(50),
    action_type VARCHAR(50),
    amount NUMERIC(10, 2),
    FOREIGN KEY (player_id) REFERENCES player(id),
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id),
    CHECK (betting_round IN ('Preflop', 'Flop', 'Turn', 'River', 'Showdown')),
    CHECK (action_type IN ('fold', 'check', 'call', 'bet', 'raise', 'collect', 'ante'))
);

CREATE TABLE player_cards (
    id SERIAL PRIMARY KEY,
    hand_id INT,
    player_id INT,
    hole_card1 CHAR(2) NULL,
    hole_card2 CHAR(2) NULL,
    position INT,
    stack_size NUMERIC(10, 2),
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id),
    FOREIGN KEY (player_id) REFERENCES player(id),
    CHECK (is_valid_card(hole_card1)),
    CHECK (is_valid_card(hole_card2))
);

CREATE TABLE board_cards (
    id SERIAL PRIMARY KEY,
    hand_id INT,
    flop_card1 CHAR(2) NULL,
    flop_card2 CHAR(2) NULL,
    flop_card3 CHAR(2) NULL,
    turn_card CHAR(2) NULL,
    river_card CHAR(2) NULL,
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id),
    CHECK (is_valid_card(flop_card1)),
    CHECK (is_valid_card(flop_card2)),
    CHECK (is_valid_card(flop_card3)),
    CHECK (is_valid_card(turn_card)),
    CHECK (is_valid_card(river_card))
);

CREATE TABLE authorized (
    user_id INT, -- user authorized
    hand_id INT, -- hand authorized to view
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id),
    PRIMARY KEY (user_id, hand_id)
);

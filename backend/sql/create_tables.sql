CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash CHAR(60), -- Assuming bcrypt hash which outputs 60 characters
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE poker_session (
    id SERIAL PRIMARY KEY,
    user_id INT,
    tournament_id BIGINT NULL,
    table_name VARCHAR(50),
    game_type VARCHAR(50),
    small_blind NUMERIC(10, 2),
    big_blind NUMERIC(10, 2),
    currency VARCHAR(10),
    total_hands INT,
    max_players INT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE TABLE poker_hand (
    id SERIAL PRIMARY KEY,
    session_id INT,
    site_hand_id BIGINT, 
    total_pot NUMERIC(10, 2),
    rake NUMERIC(10, 2),
    played_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES poker_session(id)
);

CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE player_action (
    id SERIAL PRIMARY KEY,
    player_id INT,
    hand_id INT,
    seat_number INT,
    action_type VARCHAR(50),
    amount NUMERIC(10, 2),
    FOREIGN KEY (player_id) REFERENCES player(id),
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id)
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
    CHECK (hole_card1 IS NULL OR hole_card1 ~ '^[2-9TJQKA][cdhs]$'),
    CHECK (hole_card2 IS NULL OR hole_card2 ~ '^[2-9TJQKA][cdhs]$')
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
    CHECK (flop_card1 IS NULL OR flop_card1 ~ '^[2-9TJQKA][cdhs]$'),
    CHECK (flop_card2 IS NULL OR flop_card2 ~ '^[2-9TJQKA][cdhs]$'),
    CHECK (flop_card3 IS NULL OR flop_card3 ~ '^[2-9TJQKA][cdhs]$'),
    CHECK (turn_card IS NULL OR turn_card ~ '^[2-9TJQKA][cdhs]$'),
    CHECK (river_card IS NULL OR river_card ~ '^[2-9TJQKA][cdhs]$')
);
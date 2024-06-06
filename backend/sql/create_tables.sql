CREATE TABLE poker_hand (
    id SERIAL PRIMARY KEY,
    site_hand_id BIGINT, 
    tournament_id BIGINT NULL,
    game_type VARCHAR(50),
    small_blind NUMERIC(10, 2),
    big_blind NUMERIC(10, 2),
    currency VARCHAR(10),
    total_pot NUMERIC(10, 2),
    rake NUMERIC(10, 2),
    played_at TIMESTAMP,
    table_name VARCHAR(50),
    max_players INT
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
    hole_card1 CHAR(2),
    hole_card2 CHAR(2),
    position INT,
    stack_size NUMERIC(10, 2),
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id),
    FOREIGN KEY (player_id) REFERENCES player(id)
);

CREATE TABLE board_cards (
    id SERIAL PRIMARY KEY,
    hand_id INT,
    flop_card1 CHAR(2) NULL,
    flop_card2 CHAR(2) NULL,
    flop_card3 CHAR(2) NULL,
    turn_card CHAR(2) NULL,
    river_card CHAR(2) NULL,
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id)
);
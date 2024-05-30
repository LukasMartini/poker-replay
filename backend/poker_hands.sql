CREATE TABLE poker_hand (
    id SERIAL PRIMARY KEY,
    hand_id BIGINT,
    game_type VARCHAR(50),
    stakes VARCHAR(20),
    played_at TIMESTAMP,
    table_name VARCHAR(50),
    seat_number INT
);

CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE player_action (
    id SERIAL PRIMARY KEY,
    player_id INT,
    hand_id INT,
    seat_number INT,
    action_type VARCHAR(50),
    amount NUMERIC(10, 2),
    stack_size NUMERIC(10, 2),
    FOREIGN KEY (player_id) REFERENCES player(id),
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id)
);

CREATE TABLE board_card (
    id SERIAL PRIMARY KEY,
    hand_id INT,
    flop_card1 CHAR(2) NULL,
    flop_card2 CHAR(2) NULL,
    flop_card3 CHAR(2) NULL,
    turn_card CHAR(2) NULL,
    river_card CHAR(2) NULL,
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id)
);

CREATE TABLE hand_summary (
    id SERIAL PRIMARY KEY,
    hand_id INT,
    total_pot NUMERIC(10, 2),
    rake NUMERIC(10, 2),
    board VARCHAR(20),
    FOREIGN KEY (hand_id) REFERENCES poker_hand(id)
);

CREATE TABLE player_card (
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
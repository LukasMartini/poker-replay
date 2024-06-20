-- Drop tables script

DROP TABLE IF EXISTS board_cards;
DROP TABLE IF EXISTS player_cards;
DROP TABLE IF EXISTS player_action;
DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS authorized;
DROP TABLE IF EXISTS poker_hand;
DROP TABLE IF EXISTS poker_session;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS is_valid_card;

SELECT 'All specified tables have been dropped successfully.' AS status;
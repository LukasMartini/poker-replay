-- Drop tables script

-- Disable foreign key checks to prevent errors during dropping
SET session_replication_role = 'replica';

DROP TABLE IF EXISTS board_cards;
DROP TABLE IF EXISTS player_cards;
DROP TABLE IF EXISTS player_action;
DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS poker_hand;
DROP TABLE IF EXISTS poker_session;
DROP TABLE IF EXISTS users;

DROP FUNCTION IF EXISTS is_valid_card;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

SELECT 'All specified tables have been dropped successfully.' AS status;
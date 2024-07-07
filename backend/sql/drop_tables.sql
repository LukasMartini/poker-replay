
-- Drop prepared statements
DEALLOCATE one_time_hand_info;
DEALLOCATE player_actions_in_hand;
DEALLOCATE player_cards_in_hand;

-- Drop tables
DROP TABLE IF EXISTS board_cards;
DROP TABLE IF EXISTS player_cards;
DROP TABLE IF EXISTS player_action;
DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS authorized;
DROP TABLE IF EXISTS poker_hand;
DROP TABLE IF EXISTS poker_session;
DROP TABLE IF EXISTS uploads;
DROP TABLE IF EXISTS users;

-- Drop functions
DROP FUNCTION IF EXISTS is_valid_card;

SELECT 'All specified tables have been dropped successfully.' AS status;
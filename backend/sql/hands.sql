PREPARE get_hands AS (
  SELECT * FROM poker_hand
    WHERE id = $1
);
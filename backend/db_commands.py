import psycopg2
from psycopg2 import pool
import bcrypt

DB_PARAMS = {
    "host": "localhost",
    "database": "cs348",
    "user": "admin",
    "password": "admin123"
}

connection_pool = pool.SimpleConnectionPool(1, 20, **DB_PARAMS)

def get_db_connection(pool=False):
    if pool:
        return connection_pool.getconn()
    else:
        return psycopg2.connect(**DB_PARAMS)

def release_db_connection(conn):
    connection_pool.putconn(conn)

def execute_query(query, data=None, fetch=False, return_dict=False, pool=False):
    conn = get_db_connection(pool=pool)
    if conn is None:
        return None
    
    try:
        with conn.cursor() as cur:
            if data is not None:
                cur.execute(query, data)
            else:
                cur.execute(query)
            conn.commit()
            if fetch:
                results = cur.fetchall()
                if return_dict:
                    column_names = [description[0] for description in cur.description]
                    return [dict(zip(column_names, row)) for row in results]
                return results
    finally:
        if pool:
            release_db_connection(conn)
        else:
            conn.close()

def create_user(username: str, email: str, password: str, token: str):
    query = """
    SELECT COUNT(*) FROM users WHERE username = %s OR email = %s
    """
    result = execute_query(query, (username, email), fetch=True)
    
    if result[0][0] > 0:
        print("User already exists")
        return
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode(), salt)
    hashed_password = hashed_password.decode('utf-8')
    salt = salt.decode('utf-8')

    query = """
    INSERT INTO users (username, email, password_hash, salt, token)
    VALUES (%s, %s, %s, %s, %s)
    """
    execute_query(query, (username, email, hashed_password, salt, token))

def create_upload(user_id: int, file_name: str) -> int:
    query = """
    INSERT INTO uploads (user_id, file_name, status)
    VALUES (%s, %s, 'processing')
    RETURNING id
    """
    result = execute_query(query, (user_id, file_name), fetch=True)
    upload_id = result[0][0]
    return upload_id

def delete_upload(upload_id: int):
    query = """
    DELETE FROM uploads WHERE id = %s
    """
    execute_query(query, (upload_id,))

def update_upload_status(upload_id: int, status: str):
    query = """
    UPDATE uploads SET status = %s WHERE id = %s
    """
    execute_query(query, (status, upload_id))

def get_hand_count(user_id, session_id = '-1', player_name = '-1'):
    '''Gets the number of hands registered for a user_id.'''
    print("Fetching hand count for", user_id)

    data = [user_id]

    sessionText = ""
    if session_id and session_id != '-1':
        sessionText = "AND session.id = %s"
        data.append(session_id)

    playerText=""
    if player_name and player_name != '-1':
        playerText=""" AND EXISTS 
            (SELECT * FROM player_cards WHERE hand_id = hand.id AND player_id = 
                (SELECT id FROM player WHERE name = %s)
            )
        """
        data.append(player_name)

    get_hand_query=f"""
    SELECT COUNT(*) hands
    FROM poker_session session
    JOIN poker_hand hand ON session.id = hand.session_id
    WHERE user_id = %s {sessionText} AND session.game_type = 'Cash' {playerText}
    """
    return execute_query(get_hand_query, tuple(data), fetch=True, return_dict=True)

def get_cash_flow(user_id, count='30', offset='-1', session_id='-1', ascdes = "DESC"):
    '''Returns the cash flow from a user_id for [count] hands starting from their [offset] most recent hand.'''

    data = [user_id, user_id]

    sessionText = ""
    if session_id and session_id != '-1':
        sessionText = "AND session.id = %s"
        data.append(session_id)
    
    countText = ""
    if count and count != '-1':
        countText = "LIMIT %s"
        data.append(count)
    
    offsetText = ""
    if offset and offset != '-1':
        offsetText = "OFFSET %s"
        data.append(offset)

    # Don't love injecting user_id twice, but oh well sacrifices must be made
    get_cash_flow_query=f"""
    WITH user_player AS (
        SELECT id FROM player WHERE player.user_id = %s
    ),
    hands AS (
        SELECT hand.id id, played_at
        FROM poker_session session
        JOIN poker_hand hand ON session.id = hand.session_id
        WHERE user_id = %s AND session.game_type = 'Cash' {sessionText}
    ),
    bet_amounts AS (
        SELECT hand_id, SUM(
        CASE
            WHEN action_type = 'collect' THEN amount
            ELSE -amount
        END
        ) as amount
        FROM user_player, player_action
        JOIN hands ON hands.id = player_action.hand_id
        WHERE player_id = user_player.id
        GROUP BY hand_id, player_id
    )
    SELECT played_at, hand.id AS hand_id, COALESCE(SUM(amount), 0) amount
    FROM hands hand
    JOIN bet_amounts on hand.id = bet_amounts.hand_id
    GROUP BY hand.id, played_at
    ORDER BY played_at {ascdes}
    {countText}
    {offsetText}
    """

    return execute_query(get_cash_flow_query, tuple(data), fetch=True, return_dict=True)

def one_time_hand_info(user_id, hand_id):
    query = """
    SELECT poker_hand.id, poker_hand.session_id, poker_hand.total_pot, poker_hand.rake,
           poker_hand.played_at, poker_session.table_name, poker_session.game_type, poker_hand.small_blind,
           poker_hand.big_blind, 
           board_cards.flop_card1, board_cards.flop_card2, board_cards.flop_card3,
           board_cards.turn_card, board_cards.river_card
    FROM poker_hand
    JOIN poker_session ON poker_hand.session_id = poker_session.id
    LEFT JOIN board_cards ON board_cards.hand_id = poker_hand.id
    LEFT JOIN authorized ON authorized.hand_id = poker_hand.id AND authorized.user_id = %s
    WHERE poker_hand.id = %s AND (poker_session.user_id = %s OR authorized.user_id IS NOT NULL)
    """
    
    return execute_query(query, (user_id, hand_id, user_id), fetch=True, return_dict=True)

def profile_data(username: str):
    user_data_query = ("""SELECT username, email, created_at FROM users WHERE '%s' = username""" % username)

    uploads_query = ("""SELECT uploads.id as upload_id, uploads.file_name, uploads.uploaded_at
                       FROM (SELECT users.id FROM users WHERE '%s' = username) us, uploads
                       WHERE us.id = uploads.user_id""" % username)
    
    sessions_query = ("""SELECT s.table_name, s.game_type, s.currency, s.total_hands, s.max_players, s.start_time, s.end_time, s.id
                        FROM poker_session as s, (SELECT users.id as usid, uploads.id as upid FROM users, uploads WHERE users.username = '%s' AND users.id = uploads.user_id) us
                        WHERE s.user_id = us.usid AND s.upload_id = us.upid""" % username)

    data = [execute_query(user_data_query, fetch=True),
            execute_query(uploads_query, fetch=True),
            execute_query(sessions_query, fetch=True)]

def cash_flow_to_player(user_id, player, count="-1", offset="-1"):
    data = [user_id, player, user_id]

    countText = ""
    if count and count != '-1':
        countText = "LIMIT %s"
        data.append(count)
    
    offsetText = ""
    if offset and offset != '-1':
        offsetText = "OFFSET %s"
        data.append(offset)

    query = f"""
-- find the hands where the player_id plays
WITH user_player AS (
	SELECT id FROM player WHERE player.user_id = %s
),
target_player AS (
	SELECT id FROM player WHERE player.name = %s
),
-- all hands from cash sessions you own    
hands AS (
	SELECT id, played_at
	FROM poker_hand hand
	WHERE EXISTS (
    	SELECT 1 FROM poker_session
    	WHERE poker_session.id = hand.session_id
        	AND poker_session.user_id = %s
        	AND poker_session.tournament_id IS NULL
			AND EXISTS ( SELECT * FROM player_cards, target_player WHERE hand_id = hand.id AND player_id = target_player.id )
	)
),
-- map each hand to the player that collected it
collected_hands AS (
	SELECT hand.id AS hand_id, (
        	SELECT act.player_id
        	FROM player_action act
        	WHERE act.hand_id = hand.id
            	AND act.action_type = 'collect' -- should never have multiple collects per hand
        	LIMIT 1
    	) AS collector_id, played_at
	FROM hands hand
),
-- the total amount that each person contributed to each hand
bet_amounts AS (
	SELECT hand_id, player_id, SUM(amount) as amount
	FROM player_action, user_player, target_player
	WHERE hand_id IN (SELECT id FROM hands)
		AND (player_id = user_player.id OR player_id = target_player.id)
		AND action_type in ('call', 'bet', 'raise', 'all-in')
	GROUP BY hand_id, player_id
),
-- cash flow by hand and player to/from
cash_flow as (
	SELECT
    	-- relevant player, the non-user player involved
    	(CASE
        	WHEN hand.collector_id = user_player.id
        	THEN bet_amounts.player_id
    
        	WHEN bet_amounts.player_id = user_player.id
        	THEN hand.collector_id
    
        	ELSE NULL
    	END) as player_id,
    	-- raw cash flow
    	CASE
        	-- when we win, add the amount we won from this player
        	WHEN hand.collector_id = user_player.id
        	THEN bet_amounts.amount
    
        	-- when someone else wins, if we bet, subtract the amount we lost to this player
        	WHEN bet_amounts.player_id = user_player.id
        	THEN -bet_amounts.amount
    
        	-- if we didn't win or place this bet, disregard the value
        	ELSE 0
    	END as amount,
		hand.hand_id,
		hand.played_at
	FROM user_player, collected_hands hand
	JOIN bet_amounts ON hand.hand_id = bet_amounts.hand_id
)
SELECT played_at, hand_id, amount
FROM target_player, cash_flow
WHERE cash_flow.player_id = target_player.id
ORDER BY played_at DESC
{countText}
{offsetText}
    """

    return execute_query(query, tuple(data), fetch=True, return_dict=True)

def get_sessions(user_id, count, offset):
    data = [user_id]

    countText = ""
    if count and count != '-1':
        countText = "LIMIT %s"
        data.append(count)
    
    offsetText = ""
    if offset and offset != '-1':
        offsetText = "OFFSET %s"
        data.append(offset)

    query = f"""
SELECT *
FROM poker_session
WHERE user_id = %s
{countText}
{offsetText}
    """

    return execute_query(query, tuple(data), fetch=True, return_dict=True)

def player_actions_in_hand(user_id, hand_id):
    query = """
    SELECT player.id as player_id, player.name, player_action.id, player_action.hand_id, player_action.action_type, 
           player_action.amount, player_action.betting_round
    FROM player
    JOIN player_action ON player_action.player_id = player.id
    JOIN poker_hand ON player_action.hand_id = poker_hand.id
    JOIN poker_session ON poker_hand.session_id = poker_session.id
    LEFT JOIN authorized ON authorized.hand_id = poker_hand.id AND authorized.user_id = %s
    WHERE player_action.hand_id = %s AND (poker_session.user_id = %s OR authorized.user_id IS NOT NULL)
    ORDER BY player_action.id
    """
    
    return execute_query(query, (user_id, hand_id, user_id), fetch=True, return_dict=True)

def player_cards_in_hand(user_id, hand_id):
    query = """
    SELECT player.id as player_id, player.name, player_cards.hand_id, player_cards.hole_card1, player_cards.hole_card2,
           player_cards.position, player_cards.stack_size
    FROM player
    JOIN player_cards ON player_cards.player_id = player.id
    JOIN poker_hand ON player_cards.hand_id = poker_hand.id
    JOIN poker_session ON poker_hand.session_id = poker_session.id
    LEFT JOIN authorized ON authorized.hand_id = poker_hand.id AND authorized.user_id = %s
    WHERE player_cards.hand_id = %s AND (poker_session.user_id = %s OR authorized.user_id IS NOT NULL)
    """
    
    return execute_query(query, (user_id, hand_id, user_id), fetch=True, return_dict=True)

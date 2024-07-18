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

def execute_query(query, data=None, fetch=False, pool=False):
    conn = get_db_connection(pool=pool)
    if conn is not None:
        try:
            with conn.cursor() as cur:
                if data is not None:
                    cur.execute(query, data)
                else:
                    cur.execute(query)
                conn.commit()
                if fetch:
                    return cur.fetchall()
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
    execute_query(query, (upload_id))

def update_upload_status(upload_id: int, status: str):
    query = """
    UPDATE uploads SET status = %s WHERE id = %s
    """
    execute_query(query, (status, upload_id))

def get_hand_count(user_id, session_id):
    '''Gets the number of hands registered for a user_id.'''

    data = [user_id]

    sessionText = ""
    if session_id and session_id != '-1':
        sessionText = "AND session.id = %s"
        data.append(session_id)

    get_hand_query=f"""
    SELECT COUNT(*) hands
    FROM poker_session session
    JOIN poker_hand hand ON session.id = hand.session_id
    WHERE user_id = %s {sessionText} AND session.game_type = 'Cash'
    """
    return execute_query(get_hand_query, tuple(data), fetch=True)

def get_cash_flow(user_id, count='30', offset='-1', session_id='-1'):
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
    SELECT played_at, hand.id, COALESCE(SUM(amount), 0) amount
    FROM hands hand
    JOIN bet_amounts on hand.id = bet_amounts.hand_id
    GROUP BY hand.id, played_at
    ORDER BY played_at DESC
    {countText}
    {offsetText}
    """

    return execute_query(get_cash_flow_query, tuple(data), fetch=True)

def one_time_hand_info(hand_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(f'''SELECT poker_hand.id, poker_hand.session_id, poker_hand.total_pot, poker_hand.rake,
                    poker_hand.played_at, poker_session.table_name, poker_session.game_type, poker_hand.small_blind,
                    poker_hand.big_blind, board_cards.flop_card1, board_cards.flop_card2, board_cards.flop_card3,
                    board_cards.turn_card, board_cards.river_card
                    FROM poker_hand, poker_session, board_cards
                    WHERE poker_hand.id = {hand_id} AND poker_hand.session_id = poker_session.id AND board_cards.hand_id = {hand_id}''')
    result = cur.fetchall()
    column_names = [description[0] for description in cur.description]
    data = [dict(zip(column_names, row)) for row in result]
    
    return data

def player_actions_in_hand(hand_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(f'''SELECT player.id as player_id, player.name, player_action.id, player_action.hand_id, player_action.action_type, 
                    player_action.amount, player_action.betting_round
                    FROM player, player_action
                    WHERE player_action.hand_id = {hand_id} AND player_action.player_id = player.id''')
    result = cur.fetchall()
    column_names = [description[0] for description in cur.description]
    data = [dict(zip(column_names, row)) for row in result]
    return data

def player_cards_in_hand(hand_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(f'''SELECT player.id as player_id, player.name, player_cards.hand_id, player_cards.hole_card1, player_cards.hole_card2,
                    player_cards.position, player_cards.stack_size
                    FROM player, player_cards
                    WHERE player_cards.hand_id = {hand_id} AND player_cards.player_id = player.id''')
    result = cur.fetchall()
    column_names = [description[0] for description in cur.description]
    data = [dict(zip(column_names, row)) for row in result]
    
    return data
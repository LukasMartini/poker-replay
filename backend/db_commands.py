from functools import lru_cache
from threading import Lock
import psycopg2
from psycopg2 import pool

session_creation_lock = Lock()

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

@lru_cache()
def get_or_create_cash_session(user_id, upload_id, table_name, game_type, currency, table_size, datetime_obj):
    '''Checks if a session already exists in the database, and if not, creates a new session.'''
    with session_creation_lock:
        query = """
        WITH existing_session AS (
            SELECT id FROM poker_session
            WHERE user_id = %s AND upload_id = %s AND table_name = %s AND game_type = %s AND currency = %s
        ),
        inserted_session AS (
            INSERT INTO poker_session (user_id, upload_id, table_name, game_type, currency, total_hands, max_players, start_time)
            SELECT %s, %s, %s, %s, %s, 0, %s, %s
            WHERE NOT EXISTS (SELECT 1 FROM existing_session)
            RETURNING id
        )
        SELECT id FROM existing_session
        UNION ALL
        SELECT id FROM inserted_session
        LIMIT 1
        """
        
        result = execute_query(query, (user_id, upload_id, table_name, game_type, currency,
                                       user_id, upload_id, table_name, game_type, currency, table_size, datetime_obj), fetch=True)
        return result[0][0]

@lru_cache()
def get_or_create_tournament_session(user_id, upload_id, tournament_id, buy_in, table_name, game_type, currency, table_size, datetime_obj):
    '''Checks if a session already exists in the database, and if not, creates a new session.'''
    with session_creation_lock:
        query = """
        WITH existing_session AS (
            SELECT id FROM poker_session
            WHERE user_id = %s AND upload_id = %s AND tournament_id = %s AND buy_in = %s AND table_name = %s AND game_type = %s AND currency = %s
        ),
        inserted_session AS (
            INSERT INTO poker_session (user_id, upload_id, tournament_id, buy_in, table_name, game_type, currency, total_hands, max_players, start_time)
            SELECT %s, %s, %s, %s, %s, %s, %s, 0, %s, %s
            WHERE NOT EXISTS (SELECT 1 FROM existing_session)
            RETURNING id
        )
        SELECT id FROM existing_session
        UNION ALL
        SELECT id FROM inserted_session
        LIMIT 1
        """
        
        result = execute_query(query, (user_id, upload_id, tournament_id, buy_in, table_name, game_type, currency,
                                       user_id, upload_id, tournament_id, buy_in, table_name, game_type, currency, table_size, datetime_obj), fetch=True)
        return result[0][0]

def create_hand(session_id, pokerstars_id, small_blind, big_blind, total_pot, rake, datetime_obj):
    '''Inserts a new hand into the database. Also updates the total_hands, end_time, and start_time of the session.'''
    
    query = """
    WITH updated_session AS (
        UPDATE poker_session
        SET total_hands = total_hands + 1,
            end_time = CASE
                WHEN end_time IS NULL OR %s > end_time THEN %s
                ELSE end_time
            END,
            start_time = CASE
                WHEN start_time IS NULL OR %s < start_time THEN %s
                ELSE start_time
            END
        WHERE id = %s
        RETURNING id
    )
    INSERT INTO poker_hand (session_id, site_hand_id, small_blind, big_blind, total_pot, rake, played_at)
    VALUES ((SELECT id FROM updated_session), %s, %s, %s, %s, %s, %s)
    RETURNING id;
    """
    
    result = execute_query(
        query,
        (datetime_obj, datetime_obj, datetime_obj, datetime_obj, session_id, 
         pokerstars_id, small_blind, big_blind, total_pot, rake, datetime_obj),
        fetch=True
    )
    return result[0][0]
    
@lru_cache()
def get_or_create_player_id(player_name):
    '''Checks if a player already exists in the database, and if not, creates a new player.'''
    query = """
    INSERT INTO player (name)
    VALUES (%s)
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
    """
    
    result = execute_query(query, (player_name,), fetch=True)
    return result[0][0]
    
def create_player(hand_id, player_name, position, stack_size):
    '''Inserts a new player into the database, and adds their card details to the player_cards table.'''
    player_id = get_or_create_player_id(player_name)

    # Insert player card details
    insert_cards_query = """
    INSERT INTO player_cards (hand_id, player_id, position, stack_size) 
    VALUES (%s, %s, %s, %s)
    """
    execute_query(insert_cards_query, (hand_id, player_id, position, stack_size), pool=True)

def link_player_to_user(player_name, user_id):
    '''Links a player to a user in the database.'''
    player_id = get_or_create_player_id(player_name)
    
    update_player_query = """
    UPDATE player SET user_id = %s WHERE id = %s
    """
    execute_query(update_player_query, (user_id, player_id))

def update_player_cards(hand_id, player_name, hole_cards):
    '''Updates the hole cards for a player in the database.'''
    player_id = get_or_create_player_id(player_name)
    
    hole_card1, hole_card2 = hole_cards
    
    update_cards_query = """
    UPDATE player_cards SET hole_card1 = %s, hole_card2 = %s
    WHERE hand_id = %s AND player_id = %s
    """
    execute_query(update_cards_query, (hole_card1, hole_card2, hand_id, player_id), pool=True)

def create_action(hand_id, player_name, betting_round, action, amount):
    '''Inserts a new action into the database.'''
    player_id = get_or_create_player_id(player_name)
    
    singular_forms = {
        "calls": "call",
        "folds": "fold",
        "checks": "check",
        "bets": "bet",
        "raises": "raise"
    }
    
    action = singular_forms.get(action, action)
    
    insert_action_query = """
    INSERT INTO player_action (hand_id, player_id, betting_round, action_type, amount)
    VALUES (%s, %s, %s, %s, %s)
    """
    execute_query(insert_action_query, (hand_id, player_id, betting_round, action, amount), pool=True)

def create_board(hand_id, flop_cards=None, turn_card=None, river_card=None):
    '''Inserts new board cards into the database.'''
    if not flop_cards:
        flop_card1, flop_card2, flop_card3 = None, None, None
    else:
        flop_card1, flop_card2, flop_card3 = flop_cards
    
    insert_board_query = """
    INSERT INTO board_cards (hand_id, flop_card1, flop_card2, flop_card3, turn_card, river_card)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    execute_query(insert_board_query, (hand_id, flop_card1, flop_card2, flop_card3, turn_card, river_card), pool=True)
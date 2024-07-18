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
    execute_query(insert_board_query, (hand_id, flop_card1, flop_card2, flop_card3, turn_card, river_card))

def get_hand_count(user_id):
    '''Gets the number of hands registered for a user_id.'''

    get_hand_query="""
    SELECT COUNT(*) hands
    FROM poker_session session
    JOIN poker_hand hand ON session.id = hand.session_id
    WHERE user_id = %s AND session.game_type = 'Cash'
    """
    return execute_query(get_hand_query, (user_id), fetch=True)

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
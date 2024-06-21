from functools import lru_cache
import psycopg2


DB_PARAMS = {
    "host": "localhost",
    "database": "cs348",
    "user": "admin",
    "password": "admin123"
}

def get_db_connection():
    conn = psycopg2.connect(**DB_PARAMS)
    return conn

def execute_query(query, data=None, fetch=False):
    conn = get_db_connection()
    if conn is not None:
        try:
            with conn.cursor() as cur:
                if data is not None:
                    cur.execute(query, data)
                    conn.commit()
                else:
                    cur.execute(query)
                    conn.commit()
                if fetch:
                    return cur.fetchall()
        finally:
            conn.close()

def get_or_create_cash_session(user_id, table_name, game_type, currency, table_size, datetime_obj):
    '''Checks if a session already exists in the database, and if not, creates a new session.'''

    check_query = """
    SELECT id FROM poker_session
    WHERE user_id = %s AND table_name = %s AND game_type = %s AND currency = %s
    """
    result = execute_query(check_query, (user_id, table_name, game_type, currency), fetch=True)
    
    # Check if a session was found
    if result:
        return result[0][0]  # Return existing session_id
    else:
        # If no existing session, insert a new one
        insert_query = """
        INSERT INTO poker_session 
        (user_id, table_name, game_type, currency, total_hands, max_players, start_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        """
        result = execute_query(insert_query, (user_id, table_name, game_type, currency, 0, table_size, datetime_obj), fetch=True)
        return result[0][0]

def get_or_create_tournament_session(user_id, tournament_id, buy_in, table_name, game_type, currency, table_size, datetime_obj):   
    '''Checks if a session already exists in the database, and if not, creates a new session.'''
    
    check_query = """
    SELECT id FROM poker_session
    WHERE user_id = %s AND tournament_id = %s AND buy_in = %s AND table_name = %s AND game_type = %s AND currency = %s
    """
    result = execute_query(check_query, (user_id, tournament_id, buy_in, table_name, game_type, currency), fetch=True)
    
    # Check if a session was found
    if result:
        return result[0][0]  # Return existing session_id
    else:
        # If no existing session, insert a new one
        insert_query = """
        INSERT INTO poker_session 
        (user_id, tournament_id, buy_in, table_name, game_type, currency, total_hands, max_players, start_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """
        result = execute_query(insert_query, (user_id, tournament_id, buy_in, table_name, game_type, currency, 0, table_size, datetime_obj), fetch=True)
        return result[0][0]

def create_hand(session_id, pokerstars_id, small_blind, big_blind, total_pot, rake, datetime_obj):
    '''Inserts a new hand into the database. Also updates the total_hands and end_time of the session.'''
    
    update_session_query = """
    UPDATE poker_session SET total_hands = total_hands + 1, end_time = %s
    WHERE id = %s;
    """
    
    execute_query(update_session_query, (datetime_obj, session_id))
    
    insert_hand_query = """
    INSERT INTO poker_hand (session_id, site_hand_id, small_blind, big_blind, total_pot, rake, played_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """
    result = execute_query(insert_hand_query, (session_id, pokerstars_id, small_blind, big_blind, total_pot, rake, datetime_obj), fetch=True)
    return result[0][0] 

@lru_cache()
def get_or_create_player_id(player_name):
    '''Checks if a player already exists in the database, and if not, creates a new player.'''
    player_query = "SELECT id FROM player WHERE name = %s"
    result = execute_query(player_query, (player_name,), fetch=True)
    
    if result:
        return result[0][0]
    else:
        insert_player_query = "INSERT INTO player (name) VALUES (%s) RETURNING id"
        result = execute_query(insert_player_query, (player_name,), fetch=True)
        return result[0][0]
    
def create_player(hand_id, player_name, position, stack_size):
    '''Inserts a new player into the database, and adds their card details to the player_cards table.'''
    player_id = get_or_create_player_id(player_name)

    # Insert player card details
    insert_cards_query = """
    INSERT INTO player_cards (hand_id, player_id, position, stack_size) 
    VALUES (%s, %s, %s, %s)
    """
    execute_query(insert_cards_query, (hand_id, player_id, position, stack_size))

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
    execute_query(update_cards_query, (hole_card1, hole_card2, hand_id, player_id))

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
    execute_query(insert_action_query, (hand_id, player_id, betting_round, action, amount))

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
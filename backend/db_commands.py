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
            with conn:
                with conn.cursor() as cur:
                    if data is not None:
                        cur.execute(query, data)
                    else:
                        cur.execute(query)
                    if fetch:
                        return cur.fetchall()
        finally:
            conn.close()
            

def get_or_create_session(user_id, table_name, game_type, small_blind, big_blind, currency, table_size, datetime_obj):
    '''Checks if a session already exists in the database, and if not, creates a new session.'''

    check_query = """
    SELECT id FROM poker_session
    WHERE user_id = %s AND table_name = %s AND game_type = %s AND small_blind = %s AND big_blind = %s AND currency = %s
    """
    
    result = execute_query(check_query, (user_id, table_name, game_type, small_blind, big_blind, currency), fetch=True)
    
    # Check if a session was found
    if result:
        print("Session already exists with session_id:", result[0][0])
        return result[0][0]  # Return existing session_id
    else:
        # If no existing session, insert a new one
        insert_query = """
        INSERT INTO poker_session 
        (user_id, table_name, game_type, small_blind, big_blind, currency, total_hands, max_players, start_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """
        result = execute_query(insert_query, (user_id, table_name, game_type, small_blind, big_blind, currency, 0, table_size, datetime_obj), fetch=True)
        session_id = result[0][0]
        print("Inserted new session with session_id:", session_id[0][0])
        return session_id  # Return new session_id
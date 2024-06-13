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
import re
from datetime import datetime
from convert_history import parse_hand_history
from db_commands import execute_query
import bcrypt


def create_user(username: str, email: str, password: str):
    
    query = """
    SELECT COUNT(*) FROM users WHERE username = %s OR email = %s
    """
    result = execute_query(query, (username, email), fetch=True)
    
    if result[0][0] > 0:
        print("User already exists")
        return

    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    hashed_password = hashed_password.decode('utf-8')

    query = """
    INSERT INTO users (username, email, password_hash)
    VALUES (%s, %s, %s)
    """
    execute_query(query, (username, email, hashed_password))
    print("User created")

if __name__ == "__main__":
    create_user("test_user", "test_email", "test_password")
    parse_hand_history("../hand_histories/poker_stars/handHistory-126997.txt", 1)
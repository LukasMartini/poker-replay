import re
from datetime import datetime
from backend.convert_history import parse_hand_history
from db_commands import execute_query
import bcrypt


def create_user(username: str, email: str, password: str):
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    
    query = """
    INSERT INTO users (username, email, password)
    VALUES (%s, %s, %s)
    """
    execute_query(query, (username, email, hashed_password))


if __name__ == "__main__":
    create_user("test_user", "test_email", "test_password")
    parse_hand_history("hand_histories/poker_stars/handHistory-126997.txt", 1)
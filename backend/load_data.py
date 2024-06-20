from convert_history import parse_hand_history
from db_commands import execute_query
import bcrypt


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
    execute_query(query, (username, email, hashed_password, salt))

if __name__ == "__main__":
    create_user("test_user", "test_email", "test_password", "82fd7671-cfe6-49a6-b3b8-a0df504bf55f")
    print("Parsing hand history...")
    parse_hand_history("../hand_histories/poker_stars/sample_handHistory.txt", 1)
    create_user("user2", "testemail2", "test_password", "f273d736-807e-4f8e-b919-0bc7a558d59b")
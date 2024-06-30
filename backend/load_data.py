import argparse
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

if __name__ == "__main__":    
    parser = argparse.ArgumentParser(description="Process hand history file and create user.")
    parser.add_argument('hand_history_path', type=str, help='Path to hand history')

    args = parser.parse_args()
    hand_history_path = args.hand_history_path

    create_user("test_user", "test_email", "test_password", "f273d736-807e-4f8e-b919-0bc7a558d59b")
    upload_id = create_upload(1, hand_history_path)
    with open(hand_history_path, 'r', encoding='utf-8') as file:
        content = file.read()
        parse_hand_history(content, 1, upload_id)
        update_upload_status(upload_id, 'complete')
    create_user("user2", "testemail2", "test_password", "f273d736-807e-4f8e-b919-0bc7a558d59b")
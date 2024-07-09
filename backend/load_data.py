import argparse
from db_commands import create_upload, create_user, update_upload_status
from convert_history import parse_hand_history


if __name__ == "__main__":    
    parser = argparse.ArgumentParser(description="Process hand history file and create user.")
    parser.add_argument('hand_history_path', type=str, help='Path to hand history')

    args = parser.parse_args()
    hand_history_path = args.hand_history_path

    create_user("test_user", "test@email.com", "test_password", "f273d736-807e-4f8e-b919-0bc7a558d59b")
    upload_id = create_upload(1, hand_history_path)
    with open(hand_history_path, 'r', encoding='utf-8') as file:
        content = file.read()
        parse_hand_history(content, 1, upload_id)
        update_upload_status(upload_id, 'completed')
    create_user("user2", "test2@email.com", "test_password", "f273d736-807e-4f8e-b919-0bc7a558d59b")
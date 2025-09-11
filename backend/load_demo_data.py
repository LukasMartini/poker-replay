#!/usr/bin/env python3
"""
Script to load demo data for the poker replay application.
This creates a demo user with sample hand history data.
"""

import os
import sys
import uuid
import bcrypt
from datetime import datetime, timedelta
from db_commands import create_upload, update_upload_status, get_db_connection
from convert_history import parse_hand_history

def ensure_demo_user(conn, cur, username, email, password, token=None):
    """
    Ensure demo user exists with valid token and expiry date.
    Creates user if doesn't exist, updates expiry if exists.
    """
    if not token:
        token = str(uuid.uuid4())
    
    # Set expiry to 30 days from now for robustness
    expiry_date = datetime.now() + timedelta(days=30)
    
    # Check if user exists
    cur.execute("SELECT id, token, expiry_date FROM users WHERE username = %s", (username,))
    existing_user = cur.fetchone()
    
    if existing_user:
        user_id, current_token, current_expiry = existing_user
        print(f"Demo user '{username}' already exists. Updating token and expiry date...")
        
        # Always update to ensure valid expiry date and known token
        cur.execute(
            "UPDATE users SET token = %s, expiry_date = %s WHERE username = %s", 
            (token, expiry_date, username)
        )
        conn.commit()
        print(f"Updated demo user with token: {token} (expires: {expiry_date})")
        return user_id, token
    else:
        print(f"Creating new demo user: {username}")
        
        # Create password hash
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode(), salt)
        hashed_password = hashed_password.decode('utf-8')
        salt = salt.decode('utf-8')
        
        # Insert new user
        cur.execute("""
            INSERT INTO users (username, email, password_hash, salt, token, expiry_date, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            RETURNING id
        """, (username, email, hashed_password, salt, token, expiry_date))
        
        user_result = cur.fetchone()
        if not user_result:
            raise Exception(f"Failed to create demo user: {username}")
        
        user_id = user_result[0]
        conn.commit()
        print(f"Created demo user with ID: {user_id}, token: {token}")
        return user_id, token

def load_demo_data():
    """Load demo data into the database."""
    print("Loading demo data...")
    
    # Demo user credentials
    demo_username = "demo_player"
    demo_email = "demo@example.com"
    demo_password = "demo_password"
    demo_token = "f273d736-807e-4f8e-b919-0bc7a558d59c"  # Fixed token for consistency
    
    # Demo file path
    demo_file_path = "./hand_histories/poker_stars/handHistory.txt"
    demo_email = "demo@example.com"
    demo_password = "demo_password"
    demo_token = "f273d736-807e-4f8e-b919-0bc7a558d59c"
    
    conn = None
    cur = None
    
    try:
        # Get database connection
        conn = get_db_connection()
        if not conn:
            raise Exception("Failed to connect to database")
        
        cur = conn.cursor()
        
        # Ensure demo user exists with valid credentials
        user_id, token = ensure_demo_user(conn, cur, demo_username, demo_email, demo_password, demo_token)
        
        # Check if demo file exists
        if not os.path.isfile(demo_file_path):
            print(f"Demo file not found: {demo_file_path}")
            print("Demo user created but no data loaded.")
            return
        
        # Check if demo data is already loaded for this user
        cur.execute("SELECT COUNT(*) FROM uploads WHERE user_id = %s", (user_id,))
        existing_uploads = cur.fetchone()[0]
        
        if existing_uploads > 0:
            print(f"Demo user '{demo_username}' already has {existing_uploads} uploaded files. Skipping file upload.")
        else:
            # Process demo file
            print(f"Processing demo file: {demo_file_path}")
            upload_id = None
            try:
                # Create upload record
                upload_id = create_upload(user_id, os.path.basename(demo_file_path))
                
                # Read and parse the hand history file
                with open(demo_file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    if content.strip():  # Only process non-empty files
                        parse_hand_history(content, user_id, upload_id)
                        update_upload_status(upload_id, 'completed')
                        print(f"Successfully processed: {demo_file_path}")
                    else:
                        print(f"Skipped empty file: {demo_file_path}")
                        update_upload_status(upload_id, 'failed')
                        
            except Exception as e:
                print(f"Error processing {demo_file_path}: {e}")
                if upload_id is not None:
                    update_upload_status(upload_id, 'failed')
        
        # Final verification
        cur.execute("SELECT token, expiry_date FROM users WHERE username = %s", (demo_username,))
        final_check = cur.fetchone()
        if final_check:
            token, expiry = final_check
            print(f"Demo user verification - Token: {token}, Expires: {expiry}")
        
        print("Demo data loaded successfully!")
        print(f"Demo user login: {demo_username} / {demo_password}")
        
    except Exception as e:
        print(f"Error loading demo data: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    load_demo_data()

import os
from flask import Flask, request, Response, jsonify, request
from flask_cors import CORS, cross_origin
import uuid
import bcrypt
from datetime import datetime, timedelta

from load_data import create_upload, delete_upload, update_upload_status
from db_commands import get_db_connection, get_hand_count, get_cash_flow, one_time_hand_info, player_actions_in_hand, player_cards_in_hand
from convert_history import parse_hand_history


conn = get_db_connection()
cur = conn.cursor()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = './uploads/'

def auth(auth_header):
    cur = conn.cursor()

    try: 
        parts = auth_header.split()
        print(auth_header)
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            token = parts[1]
            print(token)
            cur.execute("EXECUTE authorize(%s)", (token,))
            result = cur.fetchall()
            cur.close()
            print(result)
            return result[0][0]
        else:
            raise Exception("Invalid authorization token.")
    except Exception as e:
        print(e)
        raise e

@app.route('/api/hand_summary/<int:id>', methods=['GET'])
@cross_origin()
def hand_summary(id: int) -> Response:
    data = one_time_hand_info(id)

    return jsonify(data), 200

@app.route("/api/player_actions/<int:id>", methods=['GET'])
@cross_origin()
def player_actions(id: int) -> Response:
    data = player_actions_in_hand(id)

    return jsonify(data), 200

@app.route("/api/player_cards/<int:id>", methods=['GET'])
@cross_origin()
def player_cards(id: int) -> Response:
    data = player_cards_in_hand(id)

    return jsonify(data), 200

@app.route("/api/hand_count/<int:id>", methods=['GET'])
@cross_origin()
def hand_quantity(id: int) -> Response:
    result = get_hand_count(str(id))
    data = [{"hands": result[0][0]}]

    return jsonify(data), 200

@app.route("/api/cash_flow/<int:id>+<int:limit>+<int:offset>", methods=['GET'])
@cross_origin()
def cash_flow(id: int, limit: int, offset: int) -> Response:
    result = get_cash_flow(str(id), str(limit), str(offset))
    data = [{
        "played_at": row[0],
        "hand_id": row[1],
        "amount": row[2]
    } for row in result]

    return jsonify(data), 200

@app.route("/api/authorize", methods=['POST'])
@cross_origin()
def authorize() -> Response: 
    try: 
        user_id = auth(request.headers.get("Authorization"))
        return jsonify({"success": True, "user_id": user_id}), 200 
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 403 

@app.route("/api/signup", methods=['POST'])
@cross_origin()
def signup() -> Response:
    try:
        if request.is_json:
            data = request.get_json()  # Accessing JSON data from the request body
            # Process your data (example: registering a user)
            # Assuming data contains 'username' and 'email'
            username = data.get('username')
            email = data.get('email')
            salt = bcrypt.gensalt()
            password = data.get('password')
            hashed_password = bcrypt.hashpw(password.encode(), salt)
            hashed_password = hashed_password.decode('utf-8')
            salt = salt.decode('utf-8')
            cur.execute("EXECUTE createUser (%s, %s, %s, %s, %s, %s)", (username, email, hashed_password, str(uuid.uuid4()), datetime.now() + timedelta(days=1), salt))
            conn.commit()
            return jsonify('{"success": true}'), 200

    except Exception as e:
        print(e)
        return jsonify('{"success": false}'), 400

@app.route("/api/login", methods=['POST'])
def login():
    try:
        if request.is_json:
            data = request.get_json()  # Accessing JSON data from the request body
            password = data.get('password')
            username = data.get('username')
            cur.execute("EXECUTE login(%s)", (username,))
            conn.commit()
            result = cur.fetchall()
            hashed_password = bcrypt.hashpw(password.encode(), result[0][0].encode())
            if (hashed_password.decode("utf-8") == result[0][1]):
                token = result[0][2]
                if result[0][5] == False:
                    token = str(uuid.uuid4())
                    cur.execute("EXECUTE renewToken(%s, %s, %s)", (username, token, datetime.now() + timedelta(days=1)))
                    conn.commit()   
                return jsonify({"success": True, "token": token, "username": result[0][3], "email": result[0][4]}), 200 
            else: 
                return jsonify({"success": False, "error": "Incorrect username or password"}), 403
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": "Bad Request"}), 400 

@app.route('/api/upload', methods=['POST'])
@cross_origin()
def file_upload():
    user_id = 1  # Temporary user_id
    uploaded_files = request.files.getlist('file')
    for file in uploaded_files:
        file_name = file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
        file.save(file_path)
        
        upload_id = create_upload(user_id, file_name)
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            parse_hand_history(content, user_id, upload_id)
            update_upload_status(upload_id, 'completed')
        except:  # Bad practice
            delete_upload(upload_id)
        os.remove(file_path)

    return {'status': 'success', 'message': f'{len(uploaded_files)} files uploaded successfully!'}

if __name__ == '__main__':
    cur.execute(open('./sql/R6/fetch_hand_query_templates.sql').read())
    cur.execute(open('./sql/R10/authorization.sql').read())
    app.run(host="localhost", port=5001, debug=True)
    cur.close()
    conn.close()

import os
import threading
from flask import Flask, Response, jsonify, request
from flask_cors import CORS, cross_origin
import uuid
import bcrypt
from datetime import datetime, timedelta
from db_commands import (
    delete_upload,
    get_db_connection,
    get_hand_count,
    get_cash_flow,
    get_matching_players,
    profile_data,
    one_time_hand_info,
    player_actions_in_hand,
    player_cards_in_hand,
    cash_flow_to_player,
    get_sessions
)
from convert_history import process_file


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
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            token = parts[1]
            cur.execute("EXECUTE authorize(%s)", (token,))
            result = cur.fetchall()
            cur.close()
            return result[0][0]
        else:
            raise Exception("Invalid authorization token.")
    except Exception as e:
        print(e)
        raise e

@app.route('/api/hand_summary/<int:id>', methods=['GET'])
@cross_origin()
def hand_summary(id: int) -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        data = one_time_hand_info(user_id, id)

        return jsonify(data), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 403

@app.route("/api/player_actions/<int:id>", methods=['GET'])
@cross_origin()
def player_actions(id: int) -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        data = player_actions_in_hand(user_id, id)

        return jsonify(data), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 403

@app.route("/api/player_cards/<int:id>", methods=['GET'])
@cross_origin()
def player_cards(id: int) -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        data = player_cards_in_hand(user_id, id)

        return jsonify(data), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 403

@app.route("/api/search_player/<string:name>", methods=['GET'])
@cross_origin()
def search_player(name: str) -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        result = get_matching_players(user_id, name)

        return jsonify(result), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": str(e)}), 403 

@app.route("/api/hand_count", methods=['GET'])
@cross_origin()
def hand_quantity() -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        session_id = request.args.get("sessionid", default = -1, type = int)
        playername = request.args.get("playername", default='-1', type = str)
        result = get_hand_count(str(user_id), str(session_id), playername)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 403

@app.route("/api/cash_flow", methods=['GET'])
@cross_origin()
def cash_flow() -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        # -1 means no value, ignore the search param
        limit = request.args.get("limit", default=30, type = int)
        offset = request.args.get("offset", default=-1, type = int)
        session_id = request.args.get("sessionid", default = -1, type = int)
        playername = request.args.get("playername", default="-1", type = str) # don't ask why a strings default is "-1"
        ascendingDescending = request.args.get("descending", default='t', type = str)
        if (ascendingDescending == 't'): ascendingDescending = "DESC"
        else: ascendingDescending = "ASC"
        

        if (playername == "-1"):
            result = get_cash_flow(str(user_id), str(limit), str(offset), str(session_id), ascendingDescending)
        else:
            result = cash_flow_to_player(str(user_id), playername, str(limit), str(offset))

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 403 

@app.route("/api/sessions", methods=['GET'])
@cross_origin()
def session_list() -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        limit = request.args.get("limit", default=30, type = int)
        offset = request.args.get("offset", default=-1, type = int)

        result = get_sessions(str(user_id), str(limit), str(offset))
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 403     

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
    
@app.route("/api/profile/<string:username>", methods=['GET'])
@cross_origin()
def profile(username: str) -> Response:
    try:
        user_id = auth(request.headers.get("Authorization"))
        result = profile_data(user_id)

        return jsonify(result), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": "bad"}), 403 

@app.route('/api/upload', methods=['POST'])
@cross_origin()
def file_upload():
    try: 
        user_id = auth(request.headers.get("Authorization"))
        uploaded_files = request.files.getlist('file')
        for file in uploaded_files:
            file_name = file.filename
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
            file.save(file_path)
            threading.Thread(target=process_file, args=(user_id, file_path, file_name)).start()
                    
        return {"success": True, 'message': f'{len(uploaded_files)} files uploaded successfully!'}, 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": str(e)}), 403 

@app.route('/api/delete/<int:file_id>', methods=['GET'])
@cross_origin()
def delete_file(file_id: int):
    try: 
        user_id = auth(request.headers.get("Authorization"))
        threading.Thread(target=delete_upload, args=(user_id, file_id)).start()
        return {"success": True, 'message': f'File {file_id} deleted successfully!'}, 200
    
    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": str(e)}), 403
    
@app.route('/api/share', methods=['GET', 'POST', 'DELETE'])
@cross_origin()
def hand_share():
    try: 
        user_id = auth(request.headers.get("Authorization"))
        if request.method == 'GET':
            hand_id = request.args.get('hand_id', type = int)
            cur.execute("EXECUTE sharedWith(%s)", (hand_id,))
            conn.commit()
            result = cur.fetchall()
            column_names = [description[0] for description in cur.description]
                     
            return jsonify([dict(zip(column_names, row)) for row in result]), 200
        elif request.method == 'POST':
            data = request.get_json()  # Accessing JSON data from the request body

            shared_user = data.get('shared_user')
            hand_id = data.get('hand_id')
            cur.execute("EXECUTE getUserID(%s)", (shared_user,))
            conn.commit()
            result = cur.fetchall()
            cur.execute("EXECUTE share(%s, %s, %s)", (user_id, result[0][0], hand_id))
            conn.commit()
            
            return jsonify({"success": True}), 200 
        elif request.method == 'DELETE':
            data = request.get_json()  # Accessing JSON data from the request body
            # Handle PUT request
            shared_user = data.get('shared_id')
            hand_id = data.get('hand_id')
            cur.execute("EXECUTE unshare(%s, %s, %s)", (user_id, hand_id, shared_user))
            conn.commit()
            
            return jsonify({"success": True}), 200 

    except Exception as e:
        print(e)
        return jsonify({"success": False, "error": "Bad Request"}), 400 


if __name__ == '__main__':
    cur.execute(open('./sql/R6/fetch_hand_query_templates.sql').read())
    cur.execute(open('./sql/R10/authorization.sql').read())
    cur.execute(open('./sql/R7/authorized_hands_template.sql').read())
    app.run(host="localhost", port=5001, debug=True)

    cur.close()
    conn.close()

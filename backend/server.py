import os
from flask import Flask, Response, jsonify, request
from flask_cors import CORS, cross_origin

from load_data import create_upload, delete_upload, update_upload_status
from db_commands import get_db_connection, get_hand_count, get_cash_flow, one_time_hand_info, player_actions_in_hand, player_cards_in_hand
from convert_history import parse_hand_history


conn = get_db_connection()
cur = conn.cursor()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['UPLOAD_FOLDER'] = './uploads/'


@app.route('/')
@cross_origin()
def homepage():
    return Response(status=200)

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
    app.run(host="localhost", port=5001, debug=True)
    
    cur.close()
    conn.close()
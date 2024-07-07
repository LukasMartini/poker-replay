from backend.convert_history import parse_hand_history
from backend.load_data import create_upload, delete_upload, update_upload_status
from flask import Flask, Response, jsonify, request
from db_commands import get_db_connection, execute_query
from flask_cors import CORS, cross_origin

conn = get_db_connection()
cur = conn.cursor()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
@cross_origin()
def homepage():
    return Response(status=200)

@app.route('/api/hand_summary/<int:id>', methods=['GET'])
@cross_origin()
def hand_summary(id: int) -> Response:
    # result = execute_query(f'EXECUTE one_time_hand_info({id});')
    cur.execute(f'EXECUTE one_time_hand_info({id});')
    result = cur.fetchall()
    column_names = [description[0] for description in cur.description]
    data = [dict(zip(column_names, row)) for row in result]

    return jsonify(data), 200

@app.route("/api/player_actions/<int:id>", methods=['GET'])
@cross_origin()
def player_actions(id: int) -> Response:
    # result = execute_query(f'EXECUTE player_actions_in_hand({id});')
    cur.execute(f'EXECUTE player_actions_in_hand({id});')
    result = cur.fetchall()
    column_names = [description[0] for description in cur.description]
    data = [dict(zip(column_names, row)) for row in result]

    return jsonify(data), 200

@app.route("/api/player_cards/<int:id>", methods=['GET'])
@cross_origin()
def player_cards(id: int) -> Response:
    # result = execute_query(f'EXECUTE player_cards_in_hand({id});')
    cur.execute(f'EXECUTE player_cards_in_hand({id});')
    result = cur.fetchall()
    column_names = [description[0] for description in cur.description]
    data = [dict(zip(column_names, row)) for row in result]

    return jsonify(data), 200

@app.route('/upload', methods=['POST'])
@cross_origin()
def file_upload():
    user_id = 1 # Temporary user_id
    uploaded_files = request.files.getlist('file')
    for file in uploaded_files:
        content = file.read().decode('utf-8')
        upload_id = create_upload(user_id, file.filename)
        try:
            parse_hand_history(content, user_id, upload_id)
            update_upload_status(upload_id, 'complete')
        except Exception as e: # Bad practice
            delete_upload(upload_id)
            
    return {'status': 'success', 'message': f'{len(uploaded_files)} files uploaded successfully!'}

if __name__ == '__main__':
    app.run(host="localhost", port=5001, debug=True)
    
    cur.close()
    conn.close()
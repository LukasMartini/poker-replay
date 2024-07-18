from convert_history import parse_hand_history
from load_data import create_upload, delete_upload, update_upload_status
from flask import Flask, Response, jsonify, request
from db_commands import get_db_connection
from flask_cors import CORS, cross_origin
from db_commands import get_hand_count, get_cash_flow
from db_commands import one_time_hand_info, player_actions_in_hand, player_cards_in_hand

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

@app.route("/api/cash_flow/<int:id>", methods=['GET'])
@cross_origin()
def cash_flow(id: int) -> Response:
    # -1 means no value, ignore the search param
    limit = request.args.get("limit", default=30, type = int)
    offset = request.args.get("offset", default=-1, type = int)
    session_id = request.args.get("sessionid", default = -1, type = int)

    result = get_cash_flow(str(id), str(limit), str(offset), str(session_id))
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
        content = file.read().decode('utf-8')
        upload_id = create_upload(user_id, file.filename)
        try:
            parse_hand_history(content, user_id, upload_id)
            update_upload_status(upload_id, 'complete')
        except Exception as e:  # Bad practice
            delete_upload(upload_id)

    return {'status': 'success', 'message': f'{len(uploaded_files)} files uploaded successfully!'}


if __name__ == '__main__':
    cur.execute(open('./sql/R6/fetch_hand_query_templates.sql').read())
    app.run(host="localhost", port=5001, debug=True)
    
    cur.close()
    conn.close()
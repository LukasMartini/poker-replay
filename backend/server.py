from flask import Flask, Response, jsonify
from db_commands import get_db_connection
from flask_cors import CORS, cross_origin

conn = get_db_connection()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/api/hand_summary/<int:id>', methods=['GET'])
@cross_origin()
def hand_summary(id: int) -> Response:
    cursor = conn.cursor()
    cursor.execute(f'EXECUTE one_time_hand_info({id})')
    result = cursor.fetchall()
    cursor.close()

    return Response(response=jsonify(result), status=200)

@app.route("/api/player_actions/<int:id>")
@cross_origin()
def player_actions(id: int) -> Response:
    cursor = conn.cursor()
    cursor.execute(f'EXECUTE player_actions_in_hand({id})')
    result = cursor.fetchall()
    cursor.close()

    return Response(response=jsonify(result), status=200)

@app.route("/api/player_cards/<int:id>")
@cross_origin()
def player_cards(id: int) -> Response:
    cursor = conn.cursor()
    cursor.execute(f'EXECUTE player_cards_in_hand({id})')
    result = cursor.fetchall()
    cursor.close()

    return Response(response=jsonify(result), status=200)

if __name__ == '__main__':
    cursor = conn.cursor()
    cursor.execute(open('backend/sql/fetch_hand_query_templates.sql').read())
    cursor.execute(f'EXECUTE one_time_hand_info({2})')

    app.run(host="localhost", port=5001, debug=True)

    cursor.close()
    conn.close()
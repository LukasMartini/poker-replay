from flask import Flask, Response
from db_commands import get_db_connection
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

conn = get_db_connection()

# @app.route('/api/hands', methods=['GET'])


@app.route('/api/hands/<int:id>', methods=['GET'])
@cross_origin()
def hands(id: int, username: str='test') -> str:
    cursor = conn.cursor()
    # with open ('./sql/fetch_hand_query_template.sql') as fetch_hand_query_template:
    #     cursor.execute(fetch_hand_query_template.read())
    #     cursor.execute(f'EXECUTE hand_data2({id}, \'{username}\')') 
    #     output: str = cursor.fetchall()

    cursor.close()

    response = Response(response='''{"test": 320320392}''', status=200)
    return response

# print(fetch_hand(1, 'Ted'))


if __name__ == '__main__':
    app.run(host="localhost", port=5001, debug=True)
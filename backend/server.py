from flask import Flask, Response
from db_commands import get_db_connection

app = Flask(__name__)

conn = get_db_connection()

@app.route('/')
def index():
    return Response(response="Hello World!", status=200)
    # cur = conn.cursor()
    # cur.execute('SELECT * FROM books;')
    # books = cur.fetchall()
    # cur.close()
    # conn.close()
    # return Response(response=str(books), status=200)

@app.route('/fetch_hand', methods=['GET'])
def fetch_hand(hand_id: int, username: str) -> str:
    cursor = conn.cursor()
    with open ('backend/sql/fetch_hand_query_template.sql') as fetch_hand_query_template:
        cursor.execute(fetch_hand_query_template.read())
        cursor.execute(f'EXECUTE hand_data({hand_id}, \'{username}\')') 
        output: str = cursor.fetchall()

    cursor.close()

    return Response(response=output, status=200)

print(fetch_hand(1, 'Ted'))


if __name__ == '__main__':
    app.run(host="localhost", port=5001, debug=True)
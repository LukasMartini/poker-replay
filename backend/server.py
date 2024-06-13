from flask import Flask, Response
from db_commands import get_db_connection

app = Flask(__name__)

@app.route('/')
def index():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM books;')
    books = cur.fetchall()
    cur.close()
    conn.close()
    return Response(response=str(books), status=200)


if __name__ == '__main__':
    app.run(host="localhost", port=5001, debug=True)
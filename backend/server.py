import psycopg2
from flask import Flask, Response

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
      host='localhost',
      database='cs348',
      user='admin',
      password='admin123'
    )
    return conn


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
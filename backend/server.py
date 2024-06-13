from flask import Flask, Response, jsonify
from db_commands import get_db_connection
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

conn = get_db_connection()

# @app.route('/api/hands', methods=['GET'])

@app.route('/api/hands/<int:id>', methods=['GET'])
@cross_origin()
def hands(id: int) -> str:
    cursor = conn.cursor()

    with open('./sql/hands.sql', 'r') as file:
        cursor.execute(file.read())
    
    # Execute the prepared statement
    cursor.execute(f'EXECUTE get_hands({id});')

    # Fetch all results

    output = cursor.fetchall()
    column_names = [description[0] for description in cursor.description]
    data = [dict(zip(column_names, row)) for row in output]

    cursor.execute("DEALLOCATE ALL;")

    # Close the cursor and commit the transaction
    conn.commit()
    cursor.close()

    # Format the response
    response = jsonify(data)
    response.status_code = 200
    return response

# print(fetch_hand(1, 'Ted'))


if __name__ == '__main__':
    app.run(host="localhost", port=5001, debug=True)
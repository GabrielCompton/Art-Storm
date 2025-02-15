from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.route('/api/message', methods=['GET'])
def send_message():
    return jsonify({'message': 'Hello from Flask Backend!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Runs on port 5000

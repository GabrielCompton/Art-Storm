from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

@app.route('/api/message', methods=['GET'])
def send_message():
    return jsonify({'message': 'Hello from Flask Backend!'})

@app.route('/api/upload', methods=['POST'])
def upload_image():
    data = request.json
    image_data = data.get("image")

    if not image_data:
        return jsonify({"error": "No image data received"}), 400

    # Decode base64 and save as an image
    try:
        image_data = image_data.split(",")[1]  # Remove base64 header
        with open("saved_drawing.png", "wb") as f:
            f.write(base64.b64decode(image_data))

        return jsonify({"message": "Image saved successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import datetime

app = Flask(__name__)
CORS(app)

# Define the folder where images will be stored
SAVE_FOLDER = "saved_images"
os.makedirs(SAVE_FOLDER, exist_ok=True)  # Ensure the folder exists

@app.route('/api/message', methods=['GET'])
def send_message():
    return jsonify({'message': 'Hello from Flask Backend!'})

@app.route('/api/upload', methods=['POST'])
def upload_image():
    data = request.json
    image_data = data.get("image")

    if not image_data:
        return jsonify({"error": "No image data received"}), 400

    try:
        # Generate a unique filename using timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"drawing_{timestamp}.png"
        file_path = os.path.join(SAVE_FOLDER, filename)

        # Decode base64 and save image
        image_data = image_data.split(",")[1]  # Remove base64 header
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(image_data))

        return jsonify({"message": "Image saved successfully!", "file_path": file_path})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

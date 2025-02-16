from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import subprocess

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
        image_path = "saved_drawing.png"
        with open(image_path, "wb") as f:
            f.write(base64.b64decode(image_data))

        # Call your script after saving the image
        result = subprocess.run(["python3", "midas.py", image_path], capture_output=True, text=True)

        if result.returncode == 0:
            print("Script executed successfully:", result.stdout)
            return jsonify({"message": "Image saved and script executed successfully!"})
        else:
            print("Error in script execution:", result.stderr)
            return jsonify({"error": f"Script execution failed: {result.stderr}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
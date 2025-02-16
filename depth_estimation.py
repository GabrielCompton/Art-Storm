from flask import Flask, request, jsonify
import torch
import cv2
import numpy as np
from PIL import Image
import io
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load the MiDaS model
midas = torch.hub.load('intel-isl/MiDaS', 'MiDaS_small')
midas.to('cpu')
midas.eval()

# Input transformation pipeline
transforms = torch.hub.load('intel-isl/MiDaS', 'transforms')
transform = transforms.small_transform

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            logging.error("No image file provided")
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if file.filename == '':
            logging.error("No selected file")
            return jsonify({"error": "No selected file"}), 400

        # Read image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = np.array(img)
        logging.debug(f"Input image shape: {img.shape}, dtype: {img.dtype}")

        # Transform input for MiDaS
        imgbatch = transform(img).to('cpu')
        logging.debug(f"Transformed image batch shape: {imgbatch.shape}")

        # Make a prediction
        with torch.no_grad():
            prediction = midas(imgbatch)
            logging.debug(f"Raw prediction shape: {prediction.shape}")

            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=img.shape[:2],
                mode='bicubic',
                align_corners=False
            ).squeeze()
            logging.debug(f"Interpolated prediction shape: {prediction.shape}")

            output = prediction.cpu().numpy()
            logging.debug(f"Depth map prediction shape: {output.shape}, dtype: {output.dtype}")
            logging.debug(f"Depth map prediction min: {output.min()}, max: {output.max()}")

        logging.info("Depth map prediction successful")
        # Return the depth map as an image (optional: you can encode it as base64)
        return jsonify({"depth_map": output.tolist()})
    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return jsonify({"error": "Error processing image"}), 500

if __name__ == '__main__':
    app.run(debug=True)